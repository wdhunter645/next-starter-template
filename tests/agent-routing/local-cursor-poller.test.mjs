import { describe, expect, it } from 'vitest';
import { evaluateCursorPickup, applyCursorClaim, disablePoller } from '../../scripts/agent-routing/local-cursor/poller.mjs';

const issue = {
  number: 2593,
  projectIssue: 2294,
  lane: '2294',
  labels: ['agent:cursor', 'handoff:ready'],
  latestEvent: { id: 5005523550, marker: 'CURSOR ASSIGNMENT' },
  eligible: true,
};

describe('local Cursor poller', () => {
  it('requires exact labels, eligibility, and assignment event', () => {
    expect(evaluateCursorPickup(issue, { consumedEventIds: [], activeClaims: [] }).eligible).toBe(true);
    expect(evaluateCursorPickup({ ...issue, labels: ['agent:cursor'] }, { consumedEventIds: [], activeClaims: [] }).eligible).toBe(false);
    expect(evaluateCursorPickup({ ...issue, latestEvent: { id: 1, marker: 'CURSOR STATUS' } }, { consumedEventIds: [], activeClaims: [] }).eligible).toBe(false);
  });

  it('prevents duplicate restart pickup and colliding lane claims', () => {
    expect(evaluateCursorPickup(issue, { consumedEventIds: [5005523550], activeClaims: [] }).reason).toBe('event_already_consumed');
    expect(evaluateCursorPickup(issue, { consumedEventIds: [], activeClaims: [{ lane: '2294', issue: 9999 }] }).reason).toBe('lane_already_claimed');
  });

  it('persists ACK claim state and supports safe disable', () => {
    const state = applyCursorClaim(issue, { consumedEventIds: [], activeClaims: [], enabled: true }, 'cursor/2294-001-contracts');
    expect(state.consumedEventIds).toContain(5005523550);
    expect(state.activeClaims[0].branch).toBe('cursor/2294-001-contracts');
    expect(disablePoller(state)).toMatchObject({ enabled: false, activeClaims: state.activeClaims });
  });
});
