import { describe, expect, it } from 'vitest';
import { upsertAlert, resolveAlert } from '../../scripts/agent-routing/alert-ledger.mjs';
import { createDeadLetter, replayDeadLetter } from '../../scripts/agent-routing/dead-letter.mjs';
import { calculateLatencyMetrics } from '../../scripts/agent-routing/metrics.mjs';

describe('alerts, dead letters, and metrics', () => {
  it('deduplicates alerts by subject and state revision', () => {
    const first = upsertAlert([], { subject: 'issue:2593', revision: 'r1', authority: 'cursor', code: 'ready_without_ack', now: '2026-07-17T17:00:00Z' });
    const second = upsertAlert(first.alerts, { subject: 'issue:2593', revision: 'r1', authority: 'cursor', code: 'ready_without_ack', now: '2026-07-17T17:01:00Z' });
    expect(second.alerts).toHaveLength(1);
    expect(second.created).toBe(false);
    expect(resolveAlert(second.alerts, second.alert.id, 'ack_observed')[0].status).toBe('resolved');
  });

  it('records permanent failures and bounded replay', () => {
    const record = createDeadLetter({ eventId: 'delivery-1', subject: 'issue:2593', revision: 'r1', step: 'mutation', errorClass: 'permission', message: 'denied' });
    expect(record.status).toBe('open');
    expect(replayDeadLetter(record, { now: '2026-07-17T17:10:00Z', maxAttempts: 2 }).attempts).toBe(1);
    expect(() => replayDeadLetter({ ...record, attempts: 2 }, { now: '2026-07-17T17:10:00Z', maxAttempts: 2 })).toThrow(/replay limit/);
  });

  it('calculates required latency and suppression metrics', () => {
    const metrics = calculateLatencyMetrics({
      readyAt: '2026-07-17T17:00:00Z', ackAt: '2026-07-17T17:03:00Z',
      greenAt: '2026-07-17T17:04:00Z', integratedAt: '2026-07-17T17:07:00Z',
      successorAt: '2026-07-17T17:08:00Z', handoffAt: '2026-07-17T17:09:00Z', responseAt: '2026-07-17T17:11:00Z',
      duplicatesSuppressed: 2, idleReason: 'awaiting_cursor_ack',
    });
    expect(metrics.readyToAckMinutes).toBe(3);
    expect(metrics.greenToIntegrationMinutes).toBe(3);
    expect(metrics.integrationToSuccessorMinutes).toBe(1);
    expect(metrics.handoffToResponseMinutes).toBe(2);
    expect(metrics.duplicatesSuppressed).toBe(2);
  });
});
