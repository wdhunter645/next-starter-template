import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  evaluateIssuePrContractRequest,
  findVersionedContractMarkers,
  validateBaseHeadSyntax,
  VALIDATE_ERROR_CODES,
  runCli as runValidateCli,
} from '../scripts/ci/issue_pr_contract_validate.mjs';
import {
  findExistingValidationComment,
  renderValidationComment,
  runCli as runCommentCli,
} from '../scripts/ci/issue_pr_contract_comment.mjs';
import { CONTRACT_STATUS_MARKER_PREFIX } from '../scripts/ci/issue_pr_contract.mjs';

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

  it('fails when head and base are identical', () => {
    const errors = validateBaseHeadSyntax({ headBranch: 'component/example', baseBranch: 'component/example' });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
  });

  it('fails when base is neither component/** nor main', () => {
    const errors = validateBaseHeadSyntax({ headBranch: 'cursor/1-x', baseBranch: 'feature/random' });
    expect(errors.some((error) => error.code === VALIDATE_ERROR_CODES.BASE_HEAD_INVALID)).toBe(true);
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
