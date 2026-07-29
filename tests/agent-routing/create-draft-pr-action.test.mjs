import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { resolveRepositoryState } from '../../scripts/agent-routing/state-resolver.mjs';
import { planAction } from '../../scripts/agent-routing/action-planner.mjs';
import { validateMutation, buildDraftPrPlan } from '../../scripts/agent-routing/github-actions.mjs';
import { normalizeIssuePrContractEvidence, findExistingDraftPr } from '../../scripts/agent-routing/evidence-adapters/issue-pr-contract.mjs';
import { runCreateDraftPrPlanCli, runCreateDraftPrMutationCli } from '../../scripts/agent-routing/controller.mjs';

const baseTask = {
  project: { issueNumber: 2615, lifecycle: 'active', projectBranch: 'component/issue-contract-draft-pr' },
  task: { issueNumber: 9101, id: '004', state: 'active' },
  labels: ['status:pr-ready'],
  events: [],
  pullRequests: [],
  checks: [],
  reviews: [],
  claims: [],
  consumedEventIds: [],
};

const validValidationResult = {
  ok: true,
  rev: 1,
  errors: [],
  fields: { head_branch: 'cursor/9101-example', base_branch: 'component/example' },
  liveSnapshot: {
    headSha: 'sha-head-1',
    baseSha: 'sha-base-1',
    hasDiff: true,
    changedFiles: ['scripts/example.mjs'],
  },
};

function snapshotWithContract(validationResult, existingPr = null, overrides = {}) {
  return resolveRepositoryState({
    ...baseTask,
    ...overrides,
    issuePrContract: normalizeIssuePrContractEvidence(validationResult, existingPr),
  });
}

describe('normalizeIssuePrContractEvidence (#2621)', () => {
  it('maps a valid #2620 evaluation result to flat evidence', () => {
    const evidence = normalizeIssuePrContractEvidence(validValidationResult);
    expect(evidence).toEqual({
      status: 'valid',
      rev: 1,
      actorAuthorized: true,
      headBranch: 'cursor/9101-example',
      baseBranch: 'component/example',
      headSha: 'sha-head-1',
      baseSha: 'sha-base-1',
      hasDiff: true,
      changedFiles: ['scripts/example.mjs'],
      existingPr: null,
    });
  });

  it('flags actorAuthorized false only for contract_unauthorized_trigger', () => {
    const unauthorized = { ok: false, rev: 1, errors: [{ code: 'contract_unauthorized_trigger' }], fields: {}, liveSnapshot: {} };
    expect(normalizeIssuePrContractEvidence(unauthorized).actorAuthorized).toBe(false);
    const otherFailure = { ok: false, rev: 1, errors: [{ code: 'contract_field_missing' }], fields: {}, liveSnapshot: {} };
    expect(normalizeIssuePrContractEvidence(otherFailure).actorAuthorized).toBe(true);
  });

  it('returns a missing-status placeholder when no validation result is supplied', () => {
    expect(normalizeIssuePrContractEvidence(null).status).toBe('missing');
  });
});

describe('findExistingDraftPr (#2621)', () => {
  it('matches by head branch or source issue, ignoring closed PRs', () => {
    const prs = [
      { number: 1, state: 'closed', headBranch: 'cursor/9101-example', sourceIssue: 9101 },
      { number: 2, state: 'open', headBranch: 'cursor/9101-example', sourceIssue: 9101, url: 'https://x/2' },
    ];
    expect(findExistingDraftPr(prs, { sourceIssue: 9101, headBranch: 'cursor/9101-example' }).number).toBe(2);
    expect(findExistingDraftPr(prs, { sourceIssue: 5555, headBranch: 'other' })).toBeNull();
  });
});

describe('planAction CREATE_DRAFT_PR (#2621)', () => {
  it('plans create_draft_pr for a clean, authorized, diffed contract with no existing PR', () => {
    const snapshot = snapshotWithContract(validValidationResult);
    const result = planAction(snapshot, { mode: 'advance' });
    expect(result.class).toBe('create_draft_pr');
    expect(result.mutations).toEqual([
      {
        type: 'create_draft_pr',
        issue: 9101,
        headBranch: 'cursor/9101-example',
        baseBranch: 'component/example',
        expectedHeadSha: 'sha-head-1',
        expectedBaseSha: 'sha-base-1',
        contractRev: 1,
      },
    ]);
  });

  it('is unreachable outside advance/integrate mode even with clean contract evidence', () => {
    const snapshot = snapshotWithContract(validValidationResult);
    expect(planAction(snapshot, { mode: 'observe' }).class).toBe('observe');
    expect(planAction(snapshot, { mode: 'normalize' }).class).toBe('noop');
  });

  it('fails closed with contract_invalid when #2620 validation did not pass', () => {
    const invalid = { ok: false, rev: 2, errors: [{ code: 'contract_field_missing' }], fields: {}, liveSnapshot: {} };
    const snapshot = snapshotWithContract(invalid);
    expect(planAction(snapshot, { mode: 'advance' })).toMatchObject({ class: 'noop', reason: 'contract_invalid' });
  });

  it('fails closed with contract_actor_unauthorized for an untrusted trigger actor', () => {
    const unauthorized = { ok: false, rev: 1, errors: [{ code: 'contract_unauthorized_trigger' }], fields: {}, liveSnapshot: {} };
    const snapshot = snapshotWithContract(unauthorized);
    expect(planAction(snapshot, { mode: 'advance' })).toMatchObject({ class: 'noop', reason: 'contract_actor_unauthorized' });
  });

  it('fails closed with contract_diff_empty when the head branch has no diff against base', () => {
    const noDiff = { ...validValidationResult, liveSnapshot: { ...validValidationResult.liveSnapshot, hasDiff: false } };
    const snapshot = snapshotWithContract(noDiff);
    expect(planAction(snapshot, { mode: 'advance' })).toMatchObject({ class: 'noop', reason: 'contract_diff_empty' });
  });

  it('never authorizes create_draft_pr against main', () => {
    const mainBase = { ...validValidationResult, fields: { ...validValidationResult.fields, base_branch: 'main' } };
    const snapshot = snapshotWithContract(mainBase);
    expect(planAction(snapshot, { mode: 'integrate' })).toMatchObject({ class: 'noop', reason: 'production_main_boundary' });
  });

  it('reconciles instead of duplicating when an open PR already exists for the same issue/head branch', () => {
    const existingPr = { number: 42, state: 'open', headBranch: 'cursor/9101-example', sourceIssue: 9101, url: 'https://example/pull/42' };
    const snapshot = snapshotWithContract(validValidationResult, existingPr);
    const result = planAction(snapshot, { mode: 'advance' });
    expect(result.class).toBe('noop');
    expect(result.reason).toBe('existing_pr_reconciled');
    expect(result.mutations).toEqual([
      { type: 'update_contract_comment', issue: 9101, rev: 1, prUrl: 'https://example/pull/42' },
    ]);
  });

  it('is a no-op when no contract evidence is supplied at all (unrelated routing events unaffected)', () => {
    const snapshot = resolveRepositoryState({ ...baseTask, labels: ['agent:cursor', 'handoff:ready'], events: [{ id: 1, marker: 'CURSOR ASSIGNMENT', createdAt: '2026-07-29T00:00:00Z' }] });
    const result = planAction(snapshot, { mode: 'advance' });
    expect(result.class).not.toBe('create_draft_pr');
  });
});

describe('validateMutation for create_draft_pr (#2621)', () => {
  const mutation = {
    type: 'create_draft_pr',
    issue: 9101,
    headBranch: 'cursor/9101-example',
    baseBranch: 'component/example',
    expectedHeadSha: 'sha-head-1',
    expectedBaseSha: 'sha-base-1',
    contractRev: 1,
    expectedRevision: 'rev-x',
  };

  it('accepts a complete, current-revision mutation', () => {
    expect(validateMutation(mutation, { revision: 'rev-x' })).toEqual({ ok: true, reason: 'authorized' });
  });

  it('rejects a stale expected revision', () => {
    expect(validateMutation(mutation, { revision: 'rev-y' }).reason).toBe('state_revision_changed');
  });

  it('rejects create_draft_pr targeting main', () => {
    expect(validateMutation({ ...mutation, baseBranch: 'main' }, { revision: 'rev-x' }).reason).toBe('automatic_main_merge_prohibited');
  });

  it('rejects an incomplete draft-PR mutation', () => {
    const { contractRev, ...incomplete } = mutation;
    expect(validateMutation(incomplete, { revision: 'rev-x' }).reason).toBe('incomplete_draft_pr_mutation');
  });
});

describe('buildDraftPrPlan pre-mutation re-validation (#2621)', () => {
  const mutation = {
    type: 'create_draft_pr',
    issue: 9101,
    headBranch: 'cursor/9101-example',
    baseBranch: 'component/example',
    expectedHeadSha: 'sha-head-1',
    expectedBaseSha: 'sha-base-1',
    contractRev: 1,
  };
  const freshState = {
    issueOpen: true,
    actorAuthorized: true,
    headSha: 'sha-head-1',
    baseSha: 'sha-base-1',
    contractRev: 1,
    pullRequests: [],
  };

  it('builds the draft-PR request when fresh state exactly matches the plan', () => {
    const result = buildDraftPrPlan(mutation, freshState);
    expect(result.ok).toBe(true);
    expect(result.request).toEqual({ head: 'cursor/9101-example', base: 'component/example', draft: true, issue: 9101 });
    expect(result.commentUpdateTemplate.marker).toContain('lgfc-issue-pr-contract-status:v1:valid:rev=1');
  });

  it('fails closed when a new commit landed on head_branch since planning', () => {
    const result = buildDraftPrPlan(mutation, { ...freshState, headSha: 'sha-head-2' });
    expect(result).toEqual({ ok: false, reason: 'stale_head_sha' });
  });

  it('fails closed when the contract was edited (revision bumped) since planning', () => {
    const result = buildDraftPrPlan(mutation, { ...freshState, contractRev: 2 });
    expect(result).toEqual({ ok: false, reason: 'stale_contract_revision' });
  });

  it('fails closed when the Issue closed since planning', () => {
    const result = buildDraftPrPlan(mutation, { ...freshState, issueOpen: false });
    expect(result).toEqual({ ok: false, reason: 'issue_not_open' });
  });

  it('reconciles instead of duplicating when a PR appeared for the same issue since planning', () => {
    const result = buildDraftPrPlan(mutation, {
      ...freshState,
      pullRequests: [{ state: 'open', headBranch: 'cursor/9101-example', sourceIssue: 9101, url: 'https://example/pull/99' }],
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('existing_pr_found');
    expect(result.commentUpdateTemplate.prUrl).toBe('https://example/pull/99');
  });
});

describe('CLI wiring (#2621)', () => {
  it('runCreateDraftPrPlanCli reads issue + #2620 validation result and writes a create_draft_pr plan', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-routing-plan-cli-'));
    const issuePath = path.join(tempDir, 'issue.json');
    const resultPath = path.join(tempDir, 'validation_result.json');
    const outputPath = path.join(tempDir, 'plan.json');

    fs.writeFileSync(issuePath, JSON.stringify({
      number: 9101, projectIssue: 2615, projectBranch: 'component/issue-contract-draft-pr', taskId: '004', state: 'open', labels: ['status:pr-ready'],
    }));
    fs.writeFileSync(resultPath, JSON.stringify(validValidationResult));

    const exitCode = runCreateDraftPrPlanCli({
      AGENT_ROUTING_ISSUE_JSON: issuePath,
      ISSUE_PR_CONTRACT_RESULT_JSON: resultPath,
      AGENT_ROUTING_MODE: 'advance',
      AGENT_ROUTING_PLAN_OUTPUT_JSON: outputPath,
    });

    expect(exitCode).toBe(0);
    const output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(output.plan.class).toBe('create_draft_pr');
    expect(output.apply).toBe(true);
  });

  it('runCreateDraftPrMutationCli re-validates a plan against fresh state and writes the draft-PR request', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-routing-mutate-cli-'));
    const planPath = path.join(tempDir, 'plan.json');
    const freshStatePath = path.join(tempDir, 'fresh_state.json');
    const outputPath = path.join(tempDir, 'draft_pr_output.json');

    fs.writeFileSync(planPath, JSON.stringify({
      mutations: [{
        type: 'create_draft_pr', issue: 9101, headBranch: 'cursor/9101-example', baseBranch: 'component/example',
        expectedHeadSha: 'sha-head-1', expectedBaseSha: 'sha-base-1', contractRev: 1,
      }],
    }));
    fs.writeFileSync(freshStatePath, JSON.stringify({
      issueOpen: true, actorAuthorized: true, headSha: 'sha-head-1', baseSha: 'sha-base-1', contractRev: 1, pullRequests: [],
    }));

    const exitCode = runCreateDraftPrMutationCli({
      AGENT_ROUTING_PLAN_JSON: planPath,
      AGENT_ROUTING_FRESH_STATE_JSON: freshStatePath,
      AGENT_ROUTING_DRAFT_PR_OUTPUT_JSON: outputPath,
    });

    expect(exitCode).toBe(0);
    const output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(output.ok).toBe(true);
    expect(output.request.head).toBe('cursor/9101-example');
  });
});
