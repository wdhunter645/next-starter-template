import { describe, expect, it } from 'vitest';
import { normalizeEvent } from '../../scripts/agent-routing/event-normalizer.mjs';
import { resolveRepositoryState } from '../../scripts/agent-routing/state-resolver.mjs';
import { evaluateLaneEligibility } from '../../scripts/agent-routing/lane-eligibility.mjs';
import { planAction } from '../../scripts/agent-routing/action-planner.mjs';

const baseTask = {
  project: { issueNumber: 2294, lifecycle: 'active', projectBranch: 'component/agent-issue-polling-handoff-routing' },
  task: { issueNumber: 2593, id: '001', state: 'active', predecessors: [], wakeEligible: true },
  labels: ['agent:cursor', 'handoff:ready', 'pmo:active'],
  events: [{ id: 5005523550, marker: 'CURSOR ASSIGNMENT', createdAt: '2026-07-17T16:54:00Z' }],
  pullRequests: [], checks: [], reviews: [], claims: [], consumedEventIds: [],
};

describe('routing core', () => {
  it('normalizes equivalent events to a stable identity', () => {
    const payload = { action: 'labeled', issue: { number: 2593 }, label: { name: 'handoff:ready' } };
    expect(normalizeEvent(payload, { eventName: 'issues', deliveryId: 'abc' }))
      .toEqual(normalizeEvent(payload, { eventName: 'issues', deliveryId: 'abc' }));
  });

  it('resolves exact Cursor pickup state', () => {
    const snapshot = resolveRepositoryState(baseTask);
    expect(snapshot.ambiguous).toBe(false);
    expect(snapshot.routingOwner).toBe('cursor');
    expect(snapshot.latestEvent.marker).toBe('CURSOR ASSIGNMENT');
  });

  it('fails closed on contradictory routing labels', () => {
    const snapshot = resolveRepositoryState({ ...baseTask, labels: ['agent:cursor', 'agent:ChatGPT', 'handoff:ready'] });
    expect(snapshot.ambiguous).toBe(true);
    expect(planAction(snapshot, { mode: 'advance' }).class).toBe('halt');
  });

  it('blocks colliding lane claims and permits independent lanes', () => {
    const current = resolveRepositoryState({ ...baseTask, fileScope: ['scripts/agent-routing/config.json'] });
    const collision = resolveRepositoryState({ ...baseTask, task: { ...baseTask.task, issueNumber: 2594, id: '002' }, fileScope: ['scripts/agent-routing/config.json'], claims: [{ key: 'other', lane: '2294', expiresAt: '2099-01-01T00:00:00Z' }] });
    expect(evaluateLaneEligibility(current, [collision], { now: '2026-07-17T17:00:00Z' }).eligible).toBe(false);
    const independent = resolveRepositoryState({ ...baseTask, task: { ...baseTask.task, issueNumber: 3000, id: 'x' }, project: { ...baseTask.project, issueNumber: 300 }, fileScope: ['docs/other/**'] });
    expect(evaluateLaneEligibility(current, [independent], { now: '2026-07-17T17:00:00Z' }).eligible).toBe(true);
  });

  it('returns one bounded action and never authorizes main merge', () => {
    const snapshot = resolveRepositoryState(baseTask);
    const plan = planAction(snapshot, { mode: 'advance' });
    expect(plan.class).toBe('cursor_ack_required');
    expect(plan.mutations.length).toBeGreaterThan(0);
    const mainPlan = planAction(resolveRepositoryState({ ...baseTask, pullRequests: [{ number: 1, base: 'main', state: 'open', mergeable: true }] }), { mode: 'integrate' });
    expect(mainPlan.class).toBe('human_decision');
    expect(mainPlan.mutations).toEqual([]);
  });
});
