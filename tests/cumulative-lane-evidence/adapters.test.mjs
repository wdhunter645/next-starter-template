import { describe, expect, it } from 'vitest';
import {
  EVENT_MARKER,
  parseCumulativeEvidenceEvents,
  resolveAuthoritativeEventsBySlot,
} from '../../scripts/cumulative-lane-evidence/adapters.mjs';

function eventComment({ id, createdAt, event }) {
  return { id, created_at: createdAt, body: `${EVENT_MARKER}\n${JSON.stringify(event)}` };
}

const baseEvent = {
  schemaVersion: 'lgfc-cumulative-evidence:v1',
  sourceIssue: 2883,
  workUnitId: '2678-002',
  lane: 'development',
  transition: 'enter',
  actorRole: 'implementation_operations',
  timestamp: '2026-07-31T10:00:00.000Z',
  result: 'pass',
  evidenceRefs: [],
  protectedStops: [],
  laneFields: {},
};

describe('cumulative lane evidence adapters (#2883)', () => {
  it('parses only comments that begin with the event marker', () => {
    const comments = [
      eventComment({ id: 1, createdAt: '2026-07-31T10:00:00Z', event: { ...baseEvent, idempotencyKey: 'a' } }),
      { id: 2, body: 'unrelated discussion comment' },
      { id: 3, body: `random preamble\n${EVENT_MARKER}\n{"broken":`, created_at: '2026-07-31T10:01:00Z' },
    ];
    const parsed = parseCumulativeEvidenceEvents(comments);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].event.idempotencyKey).toBe('a');
    expect(parsed[0].commentId).toBe('1');
  });

  it('ignores a marker comment with malformed JSON instead of throwing', () => {
    const comments = [{ id: 5, body: `${EVENT_MARKER}\nnot json`, created_at: '2026-07-31T10:00:00Z' }];
    expect(() => parseCumulativeEvidenceEvents(comments)).not.toThrow();
    expect(parseCumulativeEvidenceEvents(comments)).toEqual([]);
  });

  it('sorts parsed events chronologically regardless of input order', () => {
    const comments = [
      eventComment({ id: 2, createdAt: '2026-07-31T12:00:00Z', event: { ...baseEvent, idempotencyKey: 'later' } }),
      eventComment({ id: 1, createdAt: '2026-07-31T10:00:00Z', event: { ...baseEvent, idempotencyKey: 'earlier' } }),
    ];
    const parsed = parseCumulativeEvidenceEvents(comments);
    expect(parsed.map((p) => p.event.idempotencyKey)).toEqual(['earlier', 'later']);
  });

  it('resolves the latest event per slot when there is no supersession', () => {
    const parsed = parseCumulativeEvidenceEvents([
      eventComment({ id: 1, createdAt: '2026-07-31T10:00:00Z', event: { ...baseEvent, transition: 'enter', idempotencyKey: 'enter-1' } }),
      eventComment({ id: 2, createdAt: '2026-07-31T11:00:00Z', event: { ...baseEvent, transition: 'progress', idempotencyKey: 'progress-1' } }),
    ]);
    const authoritative = resolveAuthoritativeEventsBySlot(parsed);
    expect(authoritative).toHaveLength(1);
    expect(authoritative[0].event.idempotencyKey).toBe('progress-1');
  });

  it('excludes an event that a later event supersedes', () => {
    const parsed = parseCumulativeEvidenceEvents([
      eventComment({ id: 1, createdAt: '2026-07-31T10:00:00Z', event: { ...baseEvent, transition: 'exit', idempotencyKey: 'exit-1' } }),
      eventComment({
        id: 2,
        createdAt: '2026-07-31T11:00:00Z',
        event: { ...baseEvent, transition: 'correct', idempotencyKey: 'exit-2', supersedes: 'exit-1' },
      }),
    ]);
    const authoritative = resolveAuthoritativeEventsBySlot(parsed);
    expect(authoritative).toHaveLength(1);
    expect(authoritative[0].event.idempotencyKey).toBe('exit-2');
  });

  it('follows a multi-step supersession chain to the final revision', () => {
    const parsed = parseCumulativeEvidenceEvents([
      eventComment({ id: 1, createdAt: '2026-07-31T10:00:00Z', event: { ...baseEvent, idempotencyKey: 'v1' } }),
      eventComment({ id: 2, createdAt: '2026-07-31T11:00:00Z', event: { ...baseEvent, idempotencyKey: 'v2', supersedes: 'v1' } }),
      eventComment({ id: 3, createdAt: '2026-07-31T12:00:00Z', event: { ...baseEvent, idempotencyKey: 'v3', supersedes: 'v2' } }),
    ]);
    const authoritative = resolveAuthoritativeEventsBySlot(parsed);
    expect(authoritative).toHaveLength(1);
    expect(authoritative[0].event.idempotencyKey).toBe('v3');
  });

  it('keeps separate slots independent (different lane = different slot)', () => {
    const parsed = parseCumulativeEvidenceEvents([
      eventComment({ id: 1, createdAt: '2026-07-31T10:00:00Z', event: { ...baseEvent, lane: 'sandbox', idempotencyKey: 'sandbox-1' } }),
      eventComment({ id: 2, createdAt: '2026-07-31T10:00:00Z', event: { ...baseEvent, lane: 'development', idempotencyKey: 'dev-1' } }),
    ]);
    const authoritative = resolveAuthoritativeEventsBySlot(parsed);
    expect(authoritative.map((a) => a.event.idempotencyKey).sort()).toEqual(['dev-1', 'sandbox-1']);
  });
});
