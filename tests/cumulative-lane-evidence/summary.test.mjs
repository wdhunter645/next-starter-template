import { describe, expect, it, vi } from 'vitest';
import {
  SUMMARY_MARKER,
  deriveLaneSummary,
  renderSummaryComment,
  upsertSummaryComment,
} from '../../scripts/cumulative-lane-evidence/summary.mjs';
import { EVENT_MARKER, parseCumulativeEvidenceEvents } from '../../scripts/cumulative-lane-evidence/adapters.mjs';

function eventComment({ id, createdAt, event }) {
  return { id, created_at: createdAt, body: `${EVENT_MARKER}\n${JSON.stringify(event)}` };
}

const baseEvent = {
  schemaVersion: 'lgfc-cumulative-evidence:v1',
  sourceIssue: 2883,
  workUnitId: '2678-002',
  actorRole: 'implementation_operations',
  evidenceRefs: [],
  laneFields: {},
};

describe('cumulative lane evidence summary (#2883)', () => {
  it('derives an empty summary when there are no events', () => {
    expect(deriveLaneSummary([])).toEqual([]);
    expect(renderSummaryComment([])).toContain('(no events yet)');
  });

  it('reports the latest transition per lane and marks a clean exit as exited', () => {
    const parsed = [
      eventComment({ id: 1, createdAt: '2026-07-31T10:00:00Z', event: { ...baseEvent, lane: 'sandbox', transition: 'enter', result: 'pass', idempotencyKey: 's1', protectedStops: [] } }),
      eventComment({ id: 2, createdAt: '2026-07-31T11:00:00Z', event: { ...baseEvent, lane: 'sandbox', transition: 'exit', result: 'pass', idempotencyKey: 's2', protectedStops: [] } }),
    ];
    const summary = deriveLaneSummary(parseCumulativeEvidenceEvents(parsed));
    expect(summary).toEqual([{ lane: 'sandbox', transition: 'exit', result: 'pass', exited: true }]);
  });

  it('does not mark exited=true while a protected stop is active on the exit event', () => {
    const parsed = [
      eventComment({
        id: 1,
        createdAt: '2026-07-31T10:00:00Z',
        event: { ...baseEvent, lane: 'sandbox', transition: 'exit', result: 'blocked', idempotencyKey: 's3', protectedStops: ['requiredGateFailure'] },
      }),
    ];
    const summary = deriveLaneSummary(parseCumulativeEvidenceEvents(parsed));
    expect(summary[0].exited).toBe(false);
  });

  it('is idempotent: upserting twice updates the same comment rather than creating a second one', async () => {
    const requestFn = vi.fn().mockResolvedValueOnce({ id: 42 }).mockResolvedValue(null);
    const comments = [];

    const first = await upsertSummaryComment({
      token: 't',
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2883,
      comments,
      requestFn,
    });
    expect(first.updated).toBe(false);
    expect(requestFn).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'POST' }));

    comments.push({ id: 42, body: renderSummaryComment([]) });

    const second = await upsertSummaryComment({
      token: 't',
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2883,
      comments,
      requestFn,
    });
    expect(second.updated).toBe(true);
    expect(second.commentId).toBe('42');
    expect(requestFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ method: 'PATCH', path: '/issues/comments/42' }),
    );
  });

  it('never edits or removes the append-only event comments while upserting the summary', async () => {
    const requestFn = vi.fn().mockResolvedValue({ id: 100 });
    const comments = [eventComment({ id: 7, createdAt: '2026-07-31T09:00:00Z', event: { ...baseEvent, lane: 'sandbox', transition: 'enter', result: 'pass', idempotencyKey: 's4', protectedStops: [] } })];

    await upsertSummaryComment({
      token: 't',
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2883,
      comments,
      requestFn,
    });

    for (const call of requestFn.mock.calls) {
      expect(call[0].path).not.toBe('/issues/comments/7');
    }
  });

  it('renders the summary marker as the first line', () => {
    expect(renderSummaryComment([]).startsWith(SUMMARY_MARKER)).toBe(true);
  });
});
