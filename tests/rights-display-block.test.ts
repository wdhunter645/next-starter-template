import { describe, expect, it } from 'vitest';

import { evaluatePublicMemberDisplaySafety } from '../functions/_lib/content-pipeline-publication-prep';
import { evaluatePublicMemberDisplaySafety as adminExport } from '../functions/_lib/content-pipeline-candidate-admin';

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

describe('CC-002 rights display block rules (#2434)', () => {
  it('admin module re-exports the same display-safety helper', () => {
    expect(adminExport).toBe(evaluatePublicMemberDisplaySafety);
  });

  it.each([
    'unknown',
    'permission_needed',
    'permission_requested',
    'copyright_restricted',
    'blocked',
  ] as const)('blocks rights_status=%s on public surface', (rights_status) => {
    const result = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({ rights_status }),
      'public',
    );
    expect(result.allowed).toBe(false);
    expect(result.gates.rights_status.pass).toBe(false);
    expect(result.reasons).toContain(
      'rights_status must be permission_granted or public_domain_candidate before public/member display',
    );
  });

  it('allows permission_granted and public_domain_candidate when other gates pass', () => {
    expect(
      evaluatePublicMemberDisplaySafety(
        displayReadyCandidate({ rights_status: 'permission_granted' }),
        'member',
      ).allowed,
    ).toBe(true);

    expect(
      evaluatePublicMemberDisplaySafety(
        displayReadyCandidate({ rights_status: 'public_domain_candidate' }),
        'member',
      ).allowed,
    ).toBe(true);
  });

  it('blocks privacy_flag requiring review when privacy_review_status is not approved', () => {
    const pending = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({
        privacy_flag: 'living_person',
        privacy_review_status: 'not_applicable',
      }),
      'public',
    );
    expect(pending.allowed).toBe(false);
    expect(pending.gates.privacy_flag.pass).toBe(false);

    const blockedReview = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({
        privacy_flag: 'minors',
        privacy_review_status: 'pending_review',
      }),
      'member',
    );
    expect(blockedReview.allowed).toBe(false);
    expect(blockedReview.gates.privacy_review_status.pass).toBe(false);
  });

  it('allows living_person only after privacy_review_status approved', () => {
    const result = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({
        privacy_flag: 'living_person',
        privacy_review_status: 'approved',
      }),
      'public',
    );
    expect(result.allowed).toBe(true);
  });
});
