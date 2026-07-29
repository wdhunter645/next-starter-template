export function evaluateCursorPickup(issue, state = {}) {
  if (state.enabled === false) return { eligible: false, reason: 'poller_disabled' };
  if (!issue?.eligible) return { eligible: false, reason: 'manifest_ineligible' };
  const labels = issue.labels || [];
  if (!labels.includes('agent:cursor') || !labels.includes('handoff:ready')) return { eligible: false, reason: 'pickup_labels_missing' };
  if (labels.includes('handoff:in-progress') || labels.includes('agent:ChatGPT')) return { eligible: false, reason: 'contradictory_labels' };
  if (issue.latestEvent?.marker !== 'CURSOR ASSIGNMENT' && issue.latestEvent?.marker !== 'CHATGPT RESPONSE') return { eligible: false, reason: 'latest_event_not_executable' };
  if ((state.consumedEventIds || []).includes(issue.latestEvent.id)) return { eligible: false, reason: 'event_already_consumed' };
  if ((state.activeClaims || []).some((claim) => claim.lane === issue.lane && claim.issue !== issue.number)) return { eligible: false, reason: 'lane_already_claimed' };
  return { eligible: true, reason: 'eligible', eventId: issue.latestEvent.id };
}

export function applyCursorClaim(issue, state = {}, branch) {
  const result = evaluateCursorPickup(issue, state);
  if (!result.eligible) throw new Error(`Cursor pickup refused: ${result.reason}`);
  return {
    ...state,
    enabled: state.enabled !== false,
    consumedEventIds: [...new Set([...(state.consumedEventIds || []), issue.latestEvent.id])],
    activeClaims: [...(state.activeClaims || []), { lane: issue.lane, issue: issue.number, projectIssue: issue.projectIssue, branch, eventId: issue.latestEvent.id }],
    heartbeatAt: new Date().toISOString(),
  };
}

export function disablePoller(state = {}) {
  return { ...state, enabled: false, disabledAt: new Date().toISOString() };
}
