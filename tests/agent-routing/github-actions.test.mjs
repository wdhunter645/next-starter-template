import { describe, expect, it } from 'vitest';
import { validateMutation, prepareBoundedMutation, buildDraftPrPlan } from '../../scripts/agent-routing/github-actions.mjs';

describe('validateMutation (general mutation vocabulary)', () => {
  it('rejects an unsupported mutation type', () => {
    expect(validateMutation({ type: 'delete_repo', expectedRevision: 'x' }, { revision: 'x' })).toEqual({ ok: false, reason: 'unsupported_mutation' });
  });

  it('rejects an untrusted mutation regardless of type', () => {
    const result = validateMutation({ type: 'post_comment', untrusted: true, expectedRevision: 'x' }, { revision: 'x' });
    expect(result).toEqual({ ok: false, reason: 'untrusted_event' });
  });

  it('accepts a well-formed post_comment mutation at the current revision', () => {
    expect(validateMutation({ type: 'post_comment', issue: 1, expectedRevision: 'x' }, { revision: 'x' })).toEqual({ ok: true, reason: 'authorized' });
  });

  it('rejects create_issue that promotes to main', () => {
    const result = validateMutation({ type: 'create_issue', promoteToMain: true, expectedRevision: 'x' }, { revision: 'x' });
    expect(result).toEqual({ ok: false, reason: 'automatic_main_merge_prohibited' });
  });
});

describe('prepareBoundedMutation', () => {
  it('stamps the plan expectedRevision and actionKey onto the mutation', () => {
    const plan = { expectedRevision: 'rev-1', actionKey: 'action:abc' };
    const prepared = prepareBoundedMutation(plan, { type: 'post_comment', issue: 1 });
    expect(prepared).toEqual({ type: 'post_comment', issue: 1, expectedRevision: 'rev-1', actionKey: 'action:abc' });
  });

  it('does not overwrite a mutation-supplied expectedRevision', () => {
    const plan = { expectedRevision: 'rev-1', actionKey: 'action:abc' };
    const prepared = prepareBoundedMutation(plan, { type: 'post_comment', expectedRevision: 'rev-explicit' });
    expect(prepared.expectedRevision).toBe('rev-explicit');
  });
});

describe('buildDraftPrPlan (non-create_draft_pr input)', () => {
  it('rejects a mutation that is not create_draft_pr', () => {
    expect(buildDraftPrPlan({ type: 'post_comment' }, {})).toEqual({ ok: false, reason: 'unsupported_mutation' });
  });

  it('rejects a null mutation', () => {
    expect(buildDraftPrPlan(null, {})).toEqual({ ok: false, reason: 'unsupported_mutation' });
  });
});

describe('buildDraftPrPlan rendered-body fail-closed behavior (#2622)', () => {
  const mutation = {
    type: 'create_draft_pr',
    issue: 42,
    headBranch: 'cursor/42-example',
    baseBranch: 'component/example',
    expectedHeadSha: 'sha-head',
    expectedBaseSha: 'sha-base',
    contractRev: 1,
    // Deliberately omitted: contractFields, deliveryProfile — the
    // rendered body must fail hygiene/delivery-profile validation
    // rather than silently produce a PR request with placeholder content.
  };
  const freshState = {
    issueOpen: true,
    actorAuthorized: true,
    headSha: 'sha-head',
    baseSha: 'sha-base',
    contractRev: 1,
    pullRequests: [],
    changedFiles: ['scripts/example.mjs'],
  };

  it('creates no PR request when the mutation carries no contract fields/delivery profile to render', () => {
    const result = buildDraftPrPlan(mutation, freshState);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('rendered_body_invalid');
    expect(result.request).toBeUndefined();
    expect(Array.isArray(result.renderedBodyErrors)).toBe(true);
    expect(result.renderedBodyErrors.length).toBeGreaterThan(0);
  });

  // PR #2952 review findings: a missing/empty/failed changed-file
  // computation must fail closed before rendered-body validation even
  // runs, not be silently treated as "no files changed".
  it('creates no PR request when freshState carries no changed-file evidence at all', () => {
    const { changedFiles, ...freshStateWithoutChangedFiles } = freshState;
    const result = buildDraftPrPlan(mutation, freshStateWithoutChangedFiles);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('changed_files_missing');
    expect(result.request).toBeUndefined();
  });

  it('creates no PR request when the workflow reports the diff compare failed', () => {
    const result = buildDraftPrPlan(mutation, { ...freshState, changedFilesComputeFailed: true });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('changed_files_compute_failed');
    expect(result.request).toBeUndefined();
  });
});
