import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  buildLiveSnapshot,
  detectLiveStateDrift,
  evaluateIssuePrContractRequest,
  findVersionedContractMarkers,
  validateBaseHeadSyntax,
  VALIDATE_ERROR_CODES,
  runCli as runValidateCli,
  runDriftCheckCli,
} from '../scripts/ci/issue_pr_contract_validate.mjs';
import {
  findExistingValidationComment,
  renderValidationComment,
  runCli as runCommentCli,
} from '../scripts/ci/issue_pr_contract_comment.mjs';
import { CONTRACT_STATUS_MARKER_PREFIX, findContractBlocks } from '../scripts/ci/issue_pr_contract.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_DIR = path.join(__dirname, 'fixtures/issue-pr-contract/events');

function readEvent(name) {
  return JSON.parse(fs.readFileSync(path.join(EVENTS_DIR, name), 'utf8'));
}

function toIssue(event) {
  return {
    number: event.issueNumber,
    body: event.issueBody,
    state: event.issueState,
    triggerActor: event.triggerActor,
  };
}

function toLiveState(event, overrides = {}) {
  return {
    headBranchExists: true,
    hasDiff: true,
    openPrExists: false,
    changedFiles: event.changedFiles,
    ...overrides,
  };
}

describe('evaluateIssuePrContractRequest (#2620)', () => {
  it('passes a complete, authorized, in-scope request', () => {
    const event = readEvent('valid-request.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.primarySourceIssue).toBe(event.issueNumber);
    expect(result.fields.head_branch).toBe(event.headBranch);
  });

  // #2622: reproduces pilot Issue #2958's exact shape (sandbox/* base_branch)
  // against the real evaluator, proving the complete contract now reaches
  // the `admit` planner as `ok: true` instead of `contract_invalid` — the
  // defect run 30594316244 hit live.
  it('passes a complete, authorized, in-scope request targeting a sandbox/* base branch', () => {
    const event = readEvent('valid-sandbox-request.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.fields.base_branch).toBe('sandbox/example');
    expect(result.deliveryProfile.errors).toEqual([]);
  });

  it('fails deterministically for an unauthorized trigger actor', () => {
    const event = readEvent('unauthorized-actor.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe('contract_unauthorized_trigger');
  });

  it('fails contract_marker_version_unsupported for a future marker version', () => {
    const event = readEvent('unsupported-version.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: {},
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe(VALIDATE_ERROR_CODES.MARKER_VERSION_UNSUPPORTED);
  });

  it('fails issue_not_open for a closed issue before any contract parsing', () => {
    const event = readEvent('issue-closed.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: {},
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe(VALIDATE_ERROR_CODES.ISSUE_NOT_OPEN);
  });

  it('fails delivery_profile_invalid when reused PMO fields do not satisfy delivery_profile.mjs invariants', () => {
    const event = readEvent('delivery-profile-invalid.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.code === VALIDATE_ERROR_CODES.DELIVERY_PROFILE_INVALID)).toBe(true);
  });

  it('fails closed on contract_marker_version_unsupported when a valid v1 block coexists with an unsupported-version block (governance remediation)', () => {
    const event = readEvent('mixed-marker-versions.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: {},
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe(VALIDATE_ERROR_CODES.MARKER_VERSION_UNSUPPORTED);
    // A conflicting future-version marker must never be silently dropped in
    // favor of the coexisting valid v1 block.
    expect(result.contract).toBeNull();
  });
});

describe('findVersionedContractMarkers (#2620)', () => {
  it('detects version and revision independent of the v1-only parser', () => {
    const markers = findVersionedContractMarkers('<!-- lgfc-issue-pr-contract:v3:rev=7 -->\nfoo\n<!-- /lgfc-issue-pr-contract:v3 -->');
    expect(markers).toEqual([{ version: 3, rev: 7 }]);
  });
});

describe('validateBaseHeadSyntax (#2620)', () => {
  it('passes a valid component base with a distinct head', () => {
    expect(validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'component/example' })).toEqual([]);
  });

  it('passes a valid main base with a distinct head', () => {
    expect(validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'main' })).toEqual([]);
  });

  it('fails when head and base are identical', () => {
    const errors = validateBaseHeadSyntax({ headBranch: 'component/example', baseBranch: 'component/example' });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
  });

  it('fails when base is neither component/**, sandbox/**, nor main', () => {
    const errors = validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'feature/random' });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
  });

  // #2622: the Sandbox admission tier authorizes `sandbox/*` base branches;
  // this syntactic check must accept them rather than rejecting every real
  // Sandbox Issue contract before the `admit` planner is ever reached
  // (confirmed live by the #2958 pilot dispatch — run 30594316244).
  it('passes a valid sandbox base with a distinct head', () => {
    expect(validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'sandbox/issue-contract-draft-pr' })).toEqual([]);
  });

  it('fails when head and base are identical sandbox refs', () => {
    const errors = validateBaseHeadSyntax({
      headBranch: 'sandbox/issue-contract-draft-pr',
      baseBranch: 'sandbox/issue-contract-draft-pr',
    });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
  });

  it('fails when the sandbox ref is malformed (no branch name after the prefix)', () => {
    const errors = validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'sandbox/' });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
  });

  it('fails when the ref merely starts with "sandbox" without the required separator', () => {
    const errors = validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'sandboxfoo' });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
  });

  it('still accepts `main` as base regardless of head shape (unaffected by the sandbox/component regex additions)', () => {
    expect(validateBaseHeadSyntax({ headBranch: 'sandbox/x', baseBranch: 'main' })).toEqual([]);
  });
});

describe('issue_pr_contract_comment (#2620)', () => {
  it('renders a valid-state comment with the correct marker and no error list', () => {
    const event = readEvent('valid-request.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    const body = renderValidationComment(result);
    expect(body).toContain(`${CONTRACT_STATUS_MARKER_PREFIX}:valid:rev=1`);
    expect(body).toContain('Primary source Issue: #9101');
  });

  it('renders an invalid-state comment listing every failing code', () => {
    const event = readEvent('unauthorized-actor.json');
    const result = evaluateIssuePrContractRequest({
      issue: toIssue(event),
      comments: event.comments,
      authorizedActors: event.authorizedActors,
      liveState: toLiveState(event),
    });
    const body = renderValidationComment(result);
    expect(body).toContain('contract_unauthorized_trigger');
    expect(body).toContain('trigger label has been removed');
  });

  it('finds the single existing status comment for upsert, ignoring unrelated comments', () => {
    const comments = [
      { id: 1, created_at: '2026-01-01T00:00:00Z', body: 'unrelated discussion' },
      { id: 2, created_at: '2026-01-02T00:00:00Z', body: `${CONTRACT_STATUS_MARKER_PREFIX}:invalid:rev=1\nold report` },
    ];
    const found = findExistingValidationComment(comments);
    expect(found.id).toBe(2);
  });

  it('resolves to the most recent match when more than one status comment exists (non-idempotent prior run)', () => {
    const comments = [
      { id: 1, created_at: '2026-01-01T00:00:00Z', body: `${CONTRACT_STATUS_MARKER_PREFIX}:invalid:rev=1` },
      { id: 2, created_at: '2026-01-03T00:00:00Z', body: `${CONTRACT_STATUS_MARKER_PREFIX}:valid:rev=2` },
    ];
    const found = findExistingValidationComment(comments);
    expect(found.id).toBe(2);
  });

  it('returns null when no status comment exists yet', () => {
    expect(findExistingValidationComment([{ id: 1, created_at: '2026-01-01T00:00:00Z', body: 'unrelated' }])).toBeNull();
  });
});

describe('CLI wiring (#2620)', () => {
  it('issue_pr_contract_validate.mjs runCli reads issue/comments/live-state and writes a result', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-pr-contract-validate-cli-'));
    const event = readEvent('valid-request.json');
    const issuePath = path.join(tempDir, 'issue.json');
    const commentsPath = path.join(tempDir, 'comments.json');
    const liveStatePath = path.join(tempDir, 'live_state.json');
    const actorsPath = path.join(tempDir, 'authorized_actors.json');
    const resultPath = path.join(tempDir, 'result.json');

    fs.writeFileSync(issuePath, JSON.stringify(toIssue(event)));
    fs.writeFileSync(commentsPath, JSON.stringify(event.comments));
    fs.writeFileSync(liveStatePath, JSON.stringify(toLiveState(event)));
    fs.writeFileSync(actorsPath, JSON.stringify(event.authorizedActors));

    const exitCode = runValidateCli({
      ISSUE_PR_CONTRACT_ISSUE_JSON: issuePath,
      ISSUE_PR_CONTRACT_COMMENTS_JSON: commentsPath,
      ISSUE_PR_CONTRACT_LIVE_STATE_JSON: liveStatePath,
      ISSUE_PR_CONTRACT_AUTHORIZED_ACTORS_JSON: actorsPath,
      ISSUE_PR_CONTRACT_RESULT_JSON: resultPath,
    });

    expect(exitCode).toBe(0);
    const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
    expect(result.ok).toBe(true);
    expect(result.primarySourceIssue).toBe(event.issueNumber);
  });

  it('issue_pr_contract_comment.mjs runCli renders the body and finds no existing comment on first run', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-pr-contract-comment-cli-'));
    const resultPath = path.join(tempDir, 'result.json');
    const commentsPath = path.join(tempDir, 'comments.json');
    const outputPath = path.join(tempDir, 'comment_output.json');

    fs.writeFileSync(resultPath, JSON.stringify({
      ok: true,
      rev: 1,
      primarySourceIssue: 9101,
      fields: { head_branch: 'cursor/9101-example', base_branch: 'component/example', intent_label: 'intent:feature', pr_class: 'code' },
    }));
    fs.writeFileSync(commentsPath, JSON.stringify([]));

    const exitCode = runCommentCli({
      ISSUE_PR_CONTRACT_RESULT_JSON: resultPath,
      ISSUE_PR_CONTRACT_COMMENTS_JSON: commentsPath,
      ISSUE_PR_CONTRACT_COMMENT_OUTPUT_JSON: outputPath,
    });

    expect(exitCode).toBe(0);
    const output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(output.existingCommentId).toBeNull();
    expect(output.removeLabel).toBe(false);
    expect(output.body).toContain(`${CONTRACT_STATUS_MARKER_PREFIX}:valid:rev=1`);
  });

  it('issue_pr_contract_comment.mjs runCli finds the existing comment to update and flags label removal on failure', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-pr-contract-comment-cli-fail-'));
    const resultPath = path.join(tempDir, 'result.json');
    const commentsPath = path.join(tempDir, 'comments.json');
    const outputPath = path.join(tempDir, 'comment_output.json');

    fs.writeFileSync(resultPath, JSON.stringify({
      ok: false,
      rev: 2,
      errors: [{ code: 'contract_field_missing', message: 'purpose is required.' }],
    }));
    fs.writeFileSync(commentsPath, JSON.stringify([
      { id: 42, created_at: '2026-01-01T00:00:00Z', body: `${CONTRACT_STATUS_MARKER_PREFIX}:invalid:rev=1` },
    ]));

    const exitCode = runCommentCli({
      ISSUE_PR_CONTRACT_RESULT_JSON: resultPath,
      ISSUE_PR_CONTRACT_COMMENTS_JSON: commentsPath,
      ISSUE_PR_CONTRACT_COMMENT_OUTPUT_JSON: outputPath,
    });

    expect(exitCode).toBe(0);
    const output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(output.existingCommentId).toBe(42);
    expect(output.removeLabel).toBe(true);
    expect(output.body).toContain('contract_field_missing');
  });
});

describe('live-state drift detection (governance remediation)', () => {
  it('detectLiveStateDrift finds no drift when a fresh snapshot exactly matches the evaluated one', () => {
    const snapshot = buildLiveSnapshot({
      contractBlockText: 'purpose: x\n',
      contractRev: 1,
      liveState: { headSha: 'sha-head-1', baseSha: 'sha-base-1', hasDiff: true, changedFiles: ['a.mjs'], openPrExists: false },
    });
    expect(detectLiveStateDrift(snapshot, snapshot)).toEqual([]);
  });

  it('detectLiveStateDrift reports headSha drift when a new commit lands on the head branch after evaluation', () => {
    const evaluated = buildLiveSnapshot({ contractRev: 1, contractBlockText: 'x', liveState: { headSha: 'sha-head-1', baseSha: 'sha-base-1' } });
    const fresh = buildLiveSnapshot({ contractRev: 1, contractBlockText: 'x', liveState: { headSha: 'sha-head-2', baseSha: 'sha-base-1' } });
    expect(detectLiveStateDrift(evaluated, fresh)).toEqual(['headSha']);
  });

  function buildFixture() {
    const freshIssueBody = '<!-- lgfc-issue-pr-contract:v1:rev=1 -->\npurpose: x\nhead_branch: cursor/9200-example\nbase_branch: component/example\n<!-- /lgfc-issue-pr-contract:v1 -->\n';
    const [block] = findContractBlocks(freshIssueBody);
    const evaluatedLiveState = { headSha: 'sha-head-1', baseSha: 'sha-base-1', hasDiff: true, changedFiles: ['a.mjs'], openPrExists: false };
    const evaluatedResult = {
      ok: true,
      liveSnapshot: buildLiveSnapshot({ contractBlockText: block.innerText, contractRev: block.rev, liveState: evaluatedLiveState }),
    };
    return { freshIssueBody, evaluatedLiveState, evaluatedResult };
  }

  function runDrift({ evaluatedResult, freshIssue, freshLiveState }) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-pr-contract-drift-cli-'));
    const resultPath = path.join(tempDir, 'result.json');
    const freshIssuePath = path.join(tempDir, 'fresh_issue.json');
    const freshLiveStatePath = path.join(tempDir, 'fresh_live_state.json');
    const outputPath = path.join(tempDir, 'drift_output.json');

    fs.writeFileSync(resultPath, JSON.stringify(evaluatedResult));
    fs.writeFileSync(freshIssuePath, JSON.stringify(freshIssue));
    fs.writeFileSync(freshLiveStatePath, JSON.stringify(freshLiveState));

    const exitCode = runDriftCheckCli({
      ISSUE_PR_CONTRACT_RESULT_JSON: resultPath,
      ISSUE_PR_CONTRACT_FRESH_ISSUE_JSON: freshIssuePath,
      ISSUE_PR_CONTRACT_FRESH_LIVE_STATE_JSON: freshLiveStatePath,
      ISSUE_PR_CONTRACT_DRIFT_OUTPUT_JSON: outputPath,
    });

    expect(exitCode).toBe(0);
    return JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  }

  it('runDriftCheckCli proceeds when the mutate job re-reads state that exactly matches evaluation', () => {
    const { freshIssueBody, evaluatedLiveState, evaluatedResult } = buildFixture();
    const output = runDrift({
      evaluatedResult,
      freshIssue: { number: 9200, body: freshIssueBody, state: 'open', labels: ['status:pr-ready'] },
      freshLiveState: evaluatedLiveState,
    });
    expect(output).toEqual({ proceed: true, reasons: [] });
  });

  it('runDriftCheckCli skips mutation when a new commit landed on head_branch between evaluation and mutation', () => {
    const { freshIssueBody, evaluatedLiveState, evaluatedResult } = buildFixture();
    const output = runDrift({
      evaluatedResult,
      freshIssue: { number: 9200, body: freshIssueBody, state: 'open', labels: ['status:pr-ready'] },
      freshLiveState: { ...evaluatedLiveState, headSha: 'sha-head-2' },
    });
    expect(output.proceed).toBe(false);
    expect(output.reasons).toContain('live_state_changed:headSha');
  });

  it('runDriftCheckCli skips mutation when the Issue closed between evaluation and mutation', () => {
    const { freshIssueBody, evaluatedLiveState, evaluatedResult } = buildFixture();
    const output = runDrift({
      evaluatedResult,
      freshIssue: { number: 9200, body: freshIssueBody, state: 'closed', labels: ['status:pr-ready'] },
      freshLiveState: evaluatedLiveState,
    });
    expect(output.proceed).toBe(false);
    expect(output.reasons).toContain('issue_not_open');
  });

  it('runDriftCheckCli skips mutation when the trigger label was removed between evaluation and mutation', () => {
    const { freshIssueBody, evaluatedLiveState, evaluatedResult } = buildFixture();
    const output = runDrift({
      evaluatedResult,
      freshIssue: { number: 9200, body: freshIssueBody, state: 'open', labels: [] },
      freshLiveState: evaluatedLiveState,
    });
    expect(output.proceed).toBe(false);
    expect(output.reasons).toContain('trigger_label_removed');
  });
});

describe('workflow permissions (governance re-review)', () => {
  it('mutate job declares contents:read and pull-requests:read alongside issues:write, matching what its re-fetch step calls', () => {
    const workflowPath = path.join(__dirname, '..', '.github/workflows/issue-pr-contract-validate.yml');
    const workflow = fs.readFileSync(workflowPath, 'utf8');
    const mutateBlock = workflow.slice(workflow.indexOf('\n  mutate:'));

    // repos.getBranch / repos.compareCommitsWithBasehead need contents:read;
    // pulls.list needs pull-requests:read. An explicit job-level permissions
    // map defaults every unlisted scope to none, so both must be declared
    // even though the job's only mutation is issues:write.
    const permissionsBlock = mutateBlock.slice(mutateBlock.indexOf('permissions:'), mutateBlock.indexOf('steps:'));
    expect(permissionsBlock).toContain('contents: read');
    expect(permissionsBlock).toContain('issues: write');
    expect(permissionsBlock).toContain('pull-requests: read');
  });
});
