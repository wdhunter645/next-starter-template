import { describe, expect, it } from 'vitest';

import { evaluatePublicMemberDisplaySafety } from '../functions/_lib/content-pipeline-publication-prep';

function displayReadyCandidate(
  overrides: Partial<Parameters<typeof evaluatePublicMemberDisplaySafety>[0]> = {},
) {
  return {
    review_status: 'approved_public_candidate',
    rights_status: 'permission_granted',
    privacy_review_status: 'not_applicable',
    privacy_flag: 'none',
    publication_status: 'published',
    deleted_at: null,
    ...overrides,
  };
}

describe('CC-002 content-asset display contract (#2434)', () => {
  it('requires publication_status published for live public/member display', () => {
    for (const publication_status of [
      'not_ready',
      'draft_candidate',
      'staged',
      'approved_for_publish',
      'unpublished',
      'archived',
    ]) {
      const result = evaluatePublicMemberDisplaySafety(
        displayReadyCandidate({ publication_status }),
        'public',
      );
      expect(result.allowed).toBe(false);
      expect(result.gates.publication_status.pass).toBe(false);
    }
  });

  it('requires human-approved review_status approved_public_candidate', () => {
    for (const review_status of [
      'pending_review',
      'deferred_rights_review',
      'deferred_privacy_review',
      'rejected',
      'private_internal_only',
    ]) {
      const result = evaluatePublicMemberDisplaySafety(
        displayReadyCandidate({ review_status }),
        'member',
      );
      expect(result.allowed).toBe(false);
      expect(result.gates.review_status.pass).toBe(false);
    }
  });

  it('accumulates multiple fail-closed reasons without short-circuiting', () => {
    const result = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({
        review_status: 'pending_review',
        rights_status: 'unknown',
        privacy_review_status: 'blocked',
        publication_status: 'draft_candidate',
        deleted_at: '2026-07-21T12:00:00.000Z',
      }),
      'public',
    );
    expect(result.allowed).toBe(false);
    expect(result.reasons.length).toBeGreaterThanOrEqual(4);
  });
});
