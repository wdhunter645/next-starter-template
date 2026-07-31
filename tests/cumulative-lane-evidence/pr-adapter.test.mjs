import { describe, expect, it } from 'vitest';
import { buildDevelopmentExitEventFromPr } from '../../scripts/cumulative-lane-evidence/pr-adapter.mjs';
import { validateCumulativeEvidenceEvent } from '../../scripts/cumulative-lane-evidence/validate-event.mjs';

const basePr = {
  number: 1,
  title: 'feat(#2883): implement evidence writer',
  htmlUrl: 'https://github.com/wdhunter645/next-starter-template/pull/1',
  mergeCommitSha: 'a'.repeat(40),
  changedFiles: ['scripts/cumulative-lane-evidence/write-event.mjs'],
  body: 'Implements the append-only writer.',
};

describe('cumulative lane evidence PR adapter (#2883)', () => {
  it('builds a schema-valid Development exit event from passing checks', () => {
    const event = buildDevelopmentExitEventFromPr({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      idempotencyKey: 'dev-exit-pr-1',
      pr: basePr,
      checks: [{ name: 'quality', conclusion: 'success' }],
      actorRole: 'pr_approver_engineering',
      timestamp: '2026-07-31T10:00:00.000Z',
    });

    const result = validateCumulativeEvidenceEvent(event);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(event.result).toBe('pass');
    expect(event.candidateSha).toBe(basePr.mergeCommitSha);
  });

  it('marks the event blocked when a required check did not pass, without inventing approval', () => {
    const event = buildDevelopmentExitEventFromPr({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      idempotencyKey: 'dev-exit-pr-2',
      pr: basePr,
      checks: [{ name: 'quality', conclusion: 'failure' }],
      actorRole: 'pr_approver_engineering',
      timestamp: '2026-07-31T10:00:00.000Z',
    });

    expect(event.result).toBe('blocked');
    expect(event.laneFields.reviewDispositions).toContain('quality');
  });

  it('never grants merge or Production authority by construction', () => {
    const event = buildDevelopmentExitEventFromPr({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      idempotencyKey: 'dev-exit-pr-3',
      pr: basePr,
      checks: [],
      actorRole: 'pr_approver_engineering',
    });
    expect(event.lane).toBe('development');
    expect(event.transition).toBe('exit');
    // No field on this event authorizes main promotion or self-approval.
    expect(event).not.toHaveProperty('approved');
    expect(event).not.toHaveProperty('mergeAuthorized');
  });

  it('does not invent an idempotencyKey; the caller must supply one', () => {
    const event = buildDevelopmentExitEventFromPr({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      idempotencyKey: 'exact-key-from-caller',
      pr: basePr,
      checks: [],
      actorRole: 'pr_approver_engineering',
    });
    expect(event.idempotencyKey).toBe('exact-key-from-caller');
  });
});
