import { describe, expect, it } from 'vitest';

import {
  evaluatePublicMemberDisplaySafety,
  type DisplaySurface,
} from '../functions/_lib/content-pipeline-publication-prep';

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

describe('CC-002 provenance display safety (#2434)', () => {
  const surfaces: DisplaySurface[] = ['public', 'member'];

  it.each(surfaces)('allows a fully cleared candidate on %s surface', (surface) => {
    const result = evaluatePublicMemberDisplaySafety(displayReadyCandidate(), surface);
    expect(result.allowed).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(result.surface).toBe(surface);
  });

  it.each(surfaces)('blocks soft-deleted candidates on %s surface', (surface) => {
    const result = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({ deleted_at: '2026-07-21T00:00:00.000Z' }),
      surface,
    );
    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain(
      'soft-deleted candidates (deleted_at set) must not display on public or member surfaces',
    );
    expect(result.gates.soft_delete.pass).toBe(false);
  });

  it('fails closed when deleted_at is an empty string (unknown suppression state)', () => {
    const result = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({ deleted_at: '' as unknown as string }),
      'public',
    );
    expect(result.allowed).toBe(false);
    expect(result.gates.soft_delete.pass).toBe(false);
  });

  it('blocks citation-only review status (provenance incomplete for reproduction display)', () => {
    const result = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({ review_status: 'approved_citation_reference_only' }),
      'public',
    );
    expect(result.allowed).toBe(false);
    expect(result.gates.review_status.pass).toBe(false);
  });

  it('blocks internal-reference-only provenance from public display', () => {
    const result = evaluatePublicMemberDisplaySafety(
      displayReadyCandidate({ review_status: 'approved_internal_reference' }),
      'public',
    );
    expect(result.allowed).toBe(false);
    expect(result.reasons[0]).toMatch(/approved_public_candidate/);
  });
});
