import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { resolveRepositoryState } from '../../scripts/agent-routing/state-resolver.mjs';
import { planAction } from '../../scripts/agent-routing/action-planner.mjs';
import { validateMutation, buildAdmitPrPlan } from '../../scripts/agent-routing/github-actions.mjs';
import { normalizeIssuePrContractEvidence } from '../../scripts/agent-routing/evidence-adapters/issue-pr-contract.mjs';
import { runAdmitPrMutationCli } from '../../scripts/agent-routing/controller.mjs';

const baseTask = {
  project: { issueNumber: 2615, lifecycle: 'active', projectBranch: 'component/issue-contract-draft-pr' },
  task: { issueNumber: 9201, id: '005', state: 'active' },
  labels: ['status:pr-ready'],
  events: [],
  pullRequests: [],
  checks: [],
  reviews: [],
  claims: [],
  consumedEventIds: [],
};

const contractFields = {
  primary_source_issue: 9201,
  purpose: 'Add an example sandbox script and its unit test.',
  intent_label: 'intent:feature',
  pr_class: 'code',
  allowed_paths: ['scripts/example.mjs'],
  out_of_scope_changes_present: 'NO',
  exception_issue: 'not-applicable',
  change_summary: 'Adds an example script and its unit test.',
  verification_commands: ['npm test'],
  verification_results: 'PASS',
  follow_up_required: 'NO',
  follow_up_issue: 'not-applicable',
  rollback_summary: 'Revert the PR.',
  head_branch: 'cursor/9201-example',
  base_branch: 'sandbox/issue-contract-draft-pr',
};

const sandboxDeliveryProfile = {
  deliveryModel: 'B-child',
  size: 'small',
  changeMode: 'project',
  targetEnvironment: 'component',
  approvalProfile: 'component-auto-integration',
  gateProfile: 'component-child',
  rollbackProfile: 'multi-step',
  componentBranch: 'sandbox/issue-contract-draft-pr',
  componentMaster: '#100',
};

const sandboxValidationResult = {
  ok: true,
  rev: 1,
  errors: [],
  fields: contractFields,
  deliveryProfile: sandboxDeliveryProfile,
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

describe('planAction ADMIT_ENVIRONMENT_PR (#2622 progressive admission)', () => {
  it('plans admit_environment_pr for a clean, authorized, diffed contract targeting sandbox/*', () => {
    const snapshot = snapshotWithContract(sandboxValidationResult);
    const result = planAction(snapshot, { mode: 'admit' });
    expect(result.class).toBe('admit_environment_pr');
    expect(result.mutations).toEqual([
      {
        type: 'admit_environment_pr',
        issue: 9201,
        headBranch: 'cursor/9201-example',
        baseBranch: 'sandbox/issue-contract-draft-pr',
        expectedHeadSha: 'sha-head-1',
        expectedBaseSha: 'sha-base-1',
        contractRev: 1,
        contractFields,
        deliveryProfile: sandboxDeliveryProfile,
        environmentTier: 'sandbox',
        requiredGates: ['secret_scan'],
      },
    ]);
  });

  it('resolves the development tier (secret scan + quality) for a non-sandbox, non-main target', () => {
    const devResult = {
      ...sandboxValidationResult,
      fields: { ...contractFields, base_branch: 'component/issue-contract-draft-pr' },
    };
    const snapshot = snapshotWithContract(devResult);
    const result = planAction(snapshot, { mode: 'admit' });
    expect(result.class).toBe('admit_environment_pr');
    expect(result.mutations[0].environmentTier).toBe('development');
    expect(result.mutations[0].requiredGates).toEqual(['secret_scan', 'quality']);
  });

  it('is unreachable outside admit mode, even with clean contract evidence', () => {
    const snapshot = snapshotWithContract(sandboxValidationResult);
    expect(planAction(snapshot, { mode: 'observe' }).class).toBe('observe');
    expect(planAction(snapshot, { mode: 'normalize' }).class).toBe('noop');
    // advance/integrate still take the existing #2621 create_draft_pr path,
    // never admit_environment_pr — this mode never changes that behavior.
    expect(planAction(snapshot, { mode: 'advance' }).class).toBe('create_draft_pr');
  });

  it('never authorizes admission targeting main, regardless of contract validity', () => {
    const mainResult = { ...sandboxValidationResult, fields: { ...contractFields, base_branch: 'main' } };
    const snapshot = snapshotWithContract(mainResult);
    expect(planAction(snapshot, { mode: 'admit' })).toMatchObject({ class: 'noop', reason: 'production_main_boundary' });
  });

  it('fails closed with contract_invalid when #2620 validation did not pass', () => {
    const invalid = { ok: false, rev: 2, errors: [{ code: 'contract_field_missing' }], fields: {}, liveSnapshot: {} };
    const snapshot = snapshotWithContract(invalid);
    expect(planAction(snapshot, { mode: 'admit' })).toMatchObject({ class: 'noop', reason: 'contract_invalid' });
  });

  it('fails closed with contract_actor_unauthorized for an untrusted trigger actor', () => {
    const unauthorized = { ok: false, rev: 1, errors: [{ code: 'contract_unauthorized_trigger' }], fields: {}, liveSnapshot: {} };
    const snapshot = snapshotWithContract(unauthorized);
    expect(planAction(snapshot, { mode: 'admit' })).toMatchObject({ class: 'noop', reason: 'contract_actor_unauthorized' });
  });

  it('fails closed with contract_diff_empty when the head branch has no diff against base', () => {
    const noDiff = { ...sandboxValidationResult, liveSnapshot: { ...sandboxValidationResult.liveSnapshot, hasDiff: false } };
    const snapshot = snapshotWithContract(noDiff);
    expect(planAction(snapshot, { mode: 'admit' })).toMatchObject({ class: 'noop', reason: 'contract_diff_empty' });
  });

  it('reconciles instead of duplicating when an open PR already exists for the same issue/head branch', () => {
    const existingPr = { number: 42, state: 'open', headBranch: 'cursor/9201-example', sourceIssue: 9201, url: 'https://example/pull/42' };
    const snapshot = snapshotWithContract(sandboxValidationResult, existingPr);
    const result = planAction(snapshot, { mode: 'admit' });
    expect(result.class).toBe('noop');
    expect(result.reason).toBe('existing_pr_reconciled');
    expect(result.mutations).toEqual([
      { type: 'update_contract_comment', issue: 9201, rev: 1, prUrl: 'https://example/pull/42' },
    ]);
  });
});

describe('validateMutation for admit_environment_pr (#2622)', () => {
  const mutation = {
    type: 'admit_environment_pr',
    issue: 9201,
    headBranch: 'cursor/9201-example',
    baseBranch: 'sandbox/issue-contract-draft-pr',
    expectedHeadSha: 'sha-head-1',
    expectedBaseSha: 'sha-base-1',
    contractRev: 1,
    environmentTier: 'sandbox',
    expectedRevision: 'rev-x',
  };

  it('accepts a complete, current-revision sandbox mutation', () => {
    expect(validateMutation(mutation, { revision: 'rev-x' })).toEqual({ ok: true, reason: 'authorized' });
  });

  it('rejects admission targeting main', () => {
    expect(validateMutation({ ...mutation, baseBranch: 'main' }, { revision: 'rev-x' }).reason).toBe('automatic_main_merge_prohibited');
  });

  it('rejects an environment tier outside sandbox/development', () => {
    expect(validateMutation({ ...mutation, environmentTier: 'production' }, { revision: 'rev-x' }).reason).toBe('environment_not_eligible_for_auto_admission');
    expect(validateMutation({ ...mutation, environmentTier: undefined }, { revision: 'rev-x' }).reason).toBe('environment_not_eligible_for_auto_admission');
  });

  it('rejects an incomplete admit mutation', () => {
    const { contractRev, ...incomplete } = mutation;
    expect(validateMutation(incomplete, { revision: 'rev-x' }).reason).toBe('incomplete_admit_pr_mutation');
  });
});

describe('buildAdmitPrPlan pre-mutation re-validation (#2622)', () => {
  const mutation = {
    type: 'admit_environment_pr',
    issue: 9201,
    headBranch: 'cursor/9201-example',
    baseBranch: 'sandbox/issue-contract-draft-pr',
    expectedHeadSha: 'sha-head-1',
    expectedBaseSha: 'sha-base-1',
    contractRev: 1,
    contractFields,
    deliveryProfile: sandboxDeliveryProfile,
    environmentTier: 'sandbox',
    requiredGates: ['secret_scan'],
  };
  const freshState = {
    issueOpen: true,
    actorAuthorized: true,
    headSha: 'sha-head-1',
    baseSha: 'sha-base-1',
    contractRev: 1,
    pullRequests: [],
    changedFiles: ['scripts/example.mjs'],
  };

  it('builds a non-draft PR request for sandbox admission when fresh state matches the plan', () => {
    const result = buildAdmitPrPlan(mutation, freshState);
    expect(result.ok).toBe(true);
    expect(result.environmentTier).toBe('sandbox');
    expect(result.requiredGates).toEqual(['secret_scan']);
    expect(result.request.head).toBe('cursor/9201-example');
    expect(result.request.base).toBe('sandbox/issue-contract-draft-pr');
    expect(result.request.draft).toBe(false);
    expect(result.request.title).toBe('Sandbox: source Issue #9201');
    expect(result.request.body).toContain('Allowed paths:');
    expect(result.commentUpdateTemplate.marker).toContain('lgfc-issue-pr-contract-status:v1:valid:rev=1');
  });

  it('builds a non-draft PR request for development admission with both required gates', () => {
    const devMutation = {
      ...mutation,
      baseBranch: 'component/issue-contract-draft-pr',
      environmentTier: 'development',
      requiredGates: ['secret_scan', 'quality'],
      contractFields: { ...contractFields, base_branch: 'component/issue-contract-draft-pr' },
      deliveryProfile: { ...sandboxDeliveryProfile, componentBranch: 'component/issue-contract-draft-pr' },
    };
    const result = buildAdmitPrPlan(devMutation, freshState);
    expect(result.ok).toBe(true);
    expect(result.environmentTier).toBe('development');
    expect(result.requiredGates).toEqual(['secret_scan', 'quality']);
    expect(result.request.title).toBe('Development: source Issue #9201');
  });

  it('rejects a mutation that is not admit_environment_pr', () => {
    expect(buildAdmitPrPlan({ type: 'create_draft_pr' }, freshState)).toEqual({ ok: false, reason: 'unsupported_mutation' });
    expect(buildAdmitPrPlan(null, freshState)).toEqual({ ok: false, reason: 'unsupported_mutation' });
  });

  it('never builds an admission request targeting main, even if a mutation somehow carries it', () => {
    const result = buildAdmitPrPlan({ ...mutation, baseBranch: 'main' }, freshState);
    expect(result).toEqual({ ok: false, reason: 'automatic_main_merge_prohibited' });
  });

  it('never builds an admission request for an unimplemented/invalid environment tier', () => {
    const result = buildAdmitPrPlan({ ...mutation, environmentTier: 'transition' }, freshState);
    expect(result).toEqual({ ok: false, reason: 'environment_not_eligible_for_auto_admission' });
  });

  it('fails closed when the Issue closed since planning', () => {
    expect(buildAdmitPrPlan(mutation, { ...freshState, issueOpen: false })).toEqual({ ok: false, reason: 'issue_not_open' });
  });

  it('fails closed when the trigger actor is unauthorized', () => {
    expect(buildAdmitPrPlan(mutation, { ...freshState, actorAuthorized: false })).toEqual({ ok: false, reason: 'contract_actor_unauthorized' });
  });

  it('fails closed when a new commit landed on head_branch since planning', () => {
    expect(buildAdmitPrPlan(mutation, { ...freshState, headSha: 'sha-head-2' })).toEqual({ ok: false, reason: 'stale_head_sha' });
  });

  it('fails closed when the base branch moved since planning', () => {
    expect(buildAdmitPrPlan(mutation, { ...freshState, baseSha: 'sha-base-2' })).toEqual({ ok: false, reason: 'stale_base_sha' });
  });

  it('fails closed when the contract was edited (revision bumped) since planning', () => {
    expect(buildAdmitPrPlan(mutation, { ...freshState, contractRev: 2 })).toEqual({ ok: false, reason: 'stale_contract_revision' });
  });

  it('reconciles instead of duplicating when a PR appeared for the same issue since planning', () => {
    const result = buildAdmitPrPlan(mutation, {
      ...freshState,
      pullRequests: [{ state: 'open', headBranch: 'cursor/9201-example', sourceIssue: 9201, url: 'https://example/pull/99' }],
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('existing_pr_found');
    expect(result.commentUpdateTemplate.prUrl).toBe('https://example/pull/99');
  });

  it('fails closed when freshState.changedFiles is missing, not an array, or empty (PR #2952/#2953 fail-closed reuse)', () => {
    const { changedFiles, ...withoutChangedFiles } = freshState;
    expect(buildAdmitPrPlan(mutation, withoutChangedFiles)).toMatchObject({ ok: false, reason: 'changed_files_missing' });
    expect(buildAdmitPrPlan(mutation, { ...freshState, changedFiles: [] })).toMatchObject({ ok: false, reason: 'changed_files_missing' });
    expect(buildAdmitPrPlan(mutation, { ...freshState, changedFiles: null })).toMatchObject({ ok: false, reason: 'changed_files_missing' });
  });

  it('fails closed when the workflow flags a failed changed-file compare', () => {
    const result = buildAdmitPrPlan(mutation, { ...freshState, changedFilesComputeFailed: true });
    expect(result).toEqual({ ok: false, reason: 'changed_files_compute_failed' });
  });

  it('fails closed and creates no PR request when the actual diff falls outside the rendered Allowed paths', () => {
    const result = buildAdmitPrPlan(mutation, {
      ...freshState,
      changedFiles: [...freshState.changedFiles, 'scripts/unrelated-out-of-scope.mjs'],
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('rendered_body_invalid');
    expect(result.request).toBeUndefined();
  });
});

describe('CLI wiring for admit_environment_pr (#2622)', () => {
  it('runAdmitPrMutationCli re-validates a plan against fresh state and writes the admission request', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-routing-admit-cli-'));
    const planPath = path.join(tempDir, 'plan.json');
    const freshStatePath = path.join(tempDir, 'fresh_state.json');
    const outputPath = path.join(tempDir, 'admit_pr_output.json');

    fs.writeFileSync(planPath, JSON.stringify({
      mutations: [{
        type: 'admit_environment_pr', issue: 9201, headBranch: 'cursor/9201-example', baseBranch: 'sandbox/issue-contract-draft-pr',
        expectedHeadSha: 'sha-head-1', expectedBaseSha: 'sha-base-1', contractRev: 1,
        contractFields, deliveryProfile: sandboxDeliveryProfile, environmentTier: 'sandbox', requiredGates: ['secret_scan'],
      }],
    }));
    fs.writeFileSync(freshStatePath, JSON.stringify({
      issueOpen: true, actorAuthorized: true, headSha: 'sha-head-1', baseSha: 'sha-base-1', contractRev: 1, pullRequests: [],
      changedFiles: ['scripts/example.mjs'],
    }));

    const exitCode = runAdmitPrMutationCli({
      AGENT_ROUTING_PLAN_JSON: planPath,
      AGENT_ROUTING_FRESH_STATE_JSON: freshStatePath,
      AGENT_ROUTING_ADMIT_PR_OUTPUT_JSON: outputPath,
    });

    expect(exitCode).toBe(0);
    const output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    expect(output.ok).toBe(true);
    expect(output.environmentTier).toBe('sandbox');
    expect(output.request.draft).toBe(false);
    expect(output.request.head).toBe('cursor/9201-example');
  });
});
