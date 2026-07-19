import { stableHash } from './lib/stable.mjs';
import { isFourLaneEnabled, planFourLaneAction } from './four-lane-runtime.mjs';

function plan(snapshot, klass, reason, mutations = []) {
  const base = {
    class: klass,
    reason,
    subject: snapshot.identity,
    expectedRevision: snapshot.revision,
    mutations,
  };
  return { ...base, actionKey: stableHash(base, 'action') };
}

function planConservative(snapshot, policy = {}) {
  const mode = policy.mode || 'observe';
  if (!snapshot || snapshot.ambiguous) return plan(snapshot || { identity: {}, revision: 'missing' }, 'halt', 'ambiguous_or_missing_state');
  const mainPr = (snapshot.pullRequests || []).find((pr) => pr.state === 'open' && pr.base === 'main');
  if (mainPr) return plan(snapshot, 'human_decision', 'production_main_boundary');
  if (mode === 'disabled') return plan(snapshot, 'noop', 'routing_disabled');
  if (mode === 'observe') return plan(snapshot, 'observe', 'observe_only');
  const failedRequiredCheck = (snapshot.checks || []).find(
    (check) => check.required !== false && check.status === 'completed' && check.conclusion === 'failure',
  );
  if (failedRequiredCheck) {
    const mutations = failedRequiredCheck.transient === true && failedRequiredCheck.runId
      ? [{ type: 'rerun_failed_job', runId: failedRequiredCheck.runId }]
      : [];
    return plan(
      snapshot,
      'ci_failure_disposition',
      mutations.length ? 'authorized_transient_rerun' : 'required_check_failure_requires_remediation',
      mutations,
    );
  }
  if (snapshot.routingOwner === 'chatgpt') return plan(snapshot, 'chatgpt_review', 'chatgpt_owned_state');
  if (
    snapshot.routingOwner === 'cursor'
    && snapshot.labels.includes('handoff:ready')
    && snapshot.latestEvent?.marker === 'CURSOR ASSIGNMENT'
    && !snapshot.consumedEventIds.includes(snapshot.latestEvent.id)
  ) {
    return plan(snapshot, 'cursor_ack_required', 'ready_assignment_unclaimed', [
      { type: 'post_comment', marker: 'CURSOR ACK', issue: snapshot.identity.taskIssue },
      { type: 'set_labels', add: ['handoff:in-progress'], remove: ['handoff:ready'], issue: snapshot.identity.taskIssue },
    ]);
  }
  const projectPr = (snapshot.pullRequests || []).find((pr) => pr.state === 'open' && pr.base === snapshot.identity.projectBranch);
  const checksGreen = (snapshot.checks || []).every((check) => check.required === false || check.conclusion === 'success');
  const reviewsClear = !(snapshot.reviews || []).some((review) => review.state === 'CHANGES_REQUESTED' || review.unresolved === true);
  if (projectPr && projectPr.mergeable && checksGreen && reviewsClear && mode === 'integrate') {
    return plan(snapshot, 'integrate_non_main', 'eligible_component_child', [{ type: 'merge_pr', pr: projectPr.number, base: projectPr.base }]);
  }
  if (snapshot.dependencyState === 'blocked') return plan(snapshot, 'noop', 'dependency_blocked');
  return plan(snapshot, 'noop', 'no_safe_action');
}

export function planAction(snapshot, policy = {}) {
  // Always enforce production main boundary before any planner path.
  if (snapshot && !snapshot.ambiguous) {
    const mainPr = (snapshot.pullRequests || []).find((pr) => pr.state === 'open' && pr.base === 'main');
    if (mainPr) return plan(snapshot, 'human_decision', 'production_main_boundary');
  }

  if (!isFourLaneEnabled(policy)) {
    return planConservative(snapshot, policy);
  }

  if (!snapshot || snapshot.ambiguous) {
    return plan(snapshot || { identity: {}, revision: 'missing' }, 'halt', 'ambiguous_or_missing_state');
  }
  if (policy.mode === 'disabled') return plan(snapshot, 'noop', 'routing_disabled');

  // Prefer existing cursor/chatgpt/CI dispositions when no hold/adjustment is active.
  const fourLane = planFourLaneAction(snapshot, policy);
  if (fourLane.class !== 'noop' && fourLane.class !== 'no_four_lane_action') {
    return plan(snapshot, fourLane.class, fourLane.reason, fourLane.mutations || []);
  }

  // Fall through to conservative pickup/integration when four-lane has no exclusive action.
  return planConservative(snapshot, policy);
}
