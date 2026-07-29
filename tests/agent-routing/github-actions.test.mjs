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
