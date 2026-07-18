import { describe, expect, it } from 'vitest';
import { rankWatcherCandidates } from '../../scripts/agent-routing/watcher-candidate-planner.mjs';
import { claimAction, completeClaim } from '../../scripts/agent-routing/claim-ledger.mjs';

const candidates = [
  { id: 'review-1', responsibility: 'chatgpt', safety: 5, priority: 2, unblockValue: 3, objectiveImpact: 4, hasAlert: false },
  { id: 'alert-1', responsibility: 'chatgpt', safety: 5, priority: 2, unblockValue: 2, objectiveImpact: 2, hasAlert: true },
  { id: 'cursor-1', responsibility: 'cursor', safety: 5, priority: 5, unblockValue: 5, objectiveImpact: 5, hasAlert: true },
];

describe('broad ChatGPT watcher planning and claims', () => {
  it('finds broad actionable work without an alert label', () => {
    expect(rankWatcherCandidates(candidates)[0].id).toBe('review-1');
  });

  it('uses alerts as a priority hint but not authority', () => {
    const ranked = rankWatcherCandidates(candidates.map((item) => item.id === 'alert-1' ? { ...item, priority: 5 } : item));
    expect(ranked[0].id).toBe('alert-1');
    expect(ranked.some((item) => item.id === 'cursor-1')).toBe(false);
  });

  it('allows one claim and makes overlapping watchers yield', () => {
    const first = claimAction([], { actionKey: 'review-1:r1', watcherId: 'watcher-00', now: '2026-07-17T17:00:00Z', leaseMinutes: 10 });
    expect(first.acquired).toBe(true);
    const second = claimAction(first.claims, { actionKey: 'review-1:r1', watcherId: 'watcher-12', now: '2026-07-17T17:01:00Z', leaseMinutes: 10 });
    expect(second.acquired).toBe(false);
    expect(completeClaim(first.claims, 'review-1:r1', { status: 'complete' })[0].result.status).toBe('complete');
  });
});
