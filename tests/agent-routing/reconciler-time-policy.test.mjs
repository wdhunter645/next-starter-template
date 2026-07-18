import { describe, expect, it } from 'vitest';
import { evaluateThresholds } from '../../scripts/agent-routing/time-policy.mjs';
import { reconcileSnapshots } from '../../scripts/agent-routing/reconciler.mjs';

const now = '2026-07-17T17:00:00Z';

describe('reconciliation and time policy', () => {
  it('emits deterministic threshold dispositions using an injected clock', () => {
    const result = evaluateThresholds({
      now,
      timestamps: { readyAt: '2026-07-17T16:54:00Z', heartbeatAt: '2026-07-17T16:20:00Z' },
      thresholdsMinutes: { readyWithoutAck: 5, inProgressHeartbeat: 30 },
    });
    expect(result.map((item) => item.code)).toEqual(['ready_without_ack', 'heartbeat_stale']);
  });

  it('selects independent eligible work when another lane is blocked', () => {
    const snapshots = [
      { identity: { projectIssue: 1, taskIssue: 11 }, ambiguous: false, dependencyState: 'blocked', fileScope: ['a/**'], activeClaims: [], revision: 'a' },
      { identity: { projectIssue: 2, taskIssue: 22 }, ambiguous: false, dependencyState: 'ready', fileScope: ['b/**'], activeClaims: [], revision: 'b' },
    ];
    const result = reconcileSnapshots(snapshots, { mode: 'observe', now });
    expect(result.selected.identity.taskIssue).toBe(22);
    expect(result.inventedWork).toBe(false);
  });

  it('is idempotent for repeated state', () => {
    const snapshots = [{ identity: { projectIssue: 2, taskIssue: 22 }, ambiguous: false, dependencyState: 'ready', fileScope: ['b/**'], activeClaims: [], revision: 'b' }];
    expect(reconcileSnapshots(snapshots, { mode: 'observe', now })).toEqual(reconcileSnapshots(snapshots, { mode: 'observe', now }));
  });
});
