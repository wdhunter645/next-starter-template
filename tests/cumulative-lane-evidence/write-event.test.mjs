import { describe, expect, it, vi } from 'vitest';
import {
  renderEventComment,
  writeCumulativeEvidenceEvent,
} from '../../scripts/cumulative-lane-evidence/write-event.mjs';
import { EVENT_MARKER } from '../../scripts/cumulative-lane-evidence/adapters.mjs';

const validEvent = {
  schemaVersion: 'lgfc-cumulative-evidence:v1',
  idempotencyKey: 'sandbox-enter-2883-demo-001',
  sourceIssue: 2883,
  workUnitId: '2678-002',
  lane: 'sandbox',
  transition: 'enter',
  actorRole: 'implementation_operations',
  timestamp: '2026-07-31T10:00:00.000Z',
  result: 'pass',
  evidenceRefs: [],
  protectedStops: [],
  laneFields: {},
};

describe('cumulative lane evidence writer (#2883)', () => {
  it('renders the marker followed by the exact JSON payload', () => {
    const body = renderEventComment(validEvent);
    expect(body.startsWith(EVENT_MARKER)).toBe(true);
    expect(JSON.parse(body.slice(EVENT_MARKER.length).trim())).toEqual(validEvent);
  });

  it('posts a new comment for a valid, non-duplicate event', async () => {
    const requestFn = vi.fn().mockResolvedValue({ id: 999 });
    const result = await writeCumulativeEvidenceEvent({
      token: 't',
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2883,
      event: validEvent,
      existingComments: [],
      requestFn,
    });

    expect(result).toEqual({ ok: true, written: true, commentId: '999', errors: [] });
    expect(requestFn).toHaveBeenCalledTimes(1);
    const call = requestFn.mock.calls[0][0];
    expect(call.method).toBe('POST');
    expect(call.path).toBe('/issues/2883/comments');
    expect(call.body.body.startsWith(EVENT_MARKER)).toBe(true);
  });

  it('is idempotent: a repeated write with the same idempotencyKey does not create a duplicate comment', async () => {
    const requestFn = vi.fn();
    const existingComments = [
      { id: 5, created_at: '2026-07-31T09:00:00Z', body: `${EVENT_MARKER}\n${JSON.stringify(validEvent)}` },
    ];

    const result = await writeCumulativeEvidenceEvent({
      token: 't',
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2883,
      event: validEvent,
      existingComments,
      requestFn,
    });

    expect(result).toEqual({ ok: true, written: false, commentId: '5', errors: [] });
    expect(requestFn).not.toHaveBeenCalled();
  });

  it('fails closed and does not post when the event is schema-invalid', async () => {
    const requestFn = vi.fn();
    const invalidEvent = { ...validEvent, idempotencyKey: 'invalid-1', lane: 'not-a-real-lane' };

    const result = await writeCumulativeEvidenceEvent({
      token: 't',
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2883,
      event: invalidEvent,
      existingComments: [],
      requestFn,
    });

    expect(result.ok).toBe(false);
    expect(result.written).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(requestFn).not.toHaveBeenCalled();
  });

  it('never edits or deletes an existing event comment (writer only ever POSTs)', async () => {
    const requestFn = vi.fn().mockResolvedValue({ id: 1000 });
    await writeCumulativeEvidenceEvent({
      token: 't',
      repository: 'wdhunter645/next-starter-template',
      issueNumber: 2883,
      event: { ...validEvent, idempotencyKey: 'new-event-1' },
      existingComments: [
        { id: 5, created_at: '2026-07-31T09:00:00Z', body: `${EVENT_MARKER}\n${JSON.stringify(validEvent)}` },
      ],
      requestFn,
    });

    for (const call of requestFn.mock.calls) {
      expect(call[0].method).toBe('POST');
    }
  });
});
