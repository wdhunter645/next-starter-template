import { stableHash } from './lib/stable.mjs';
import { isFourLaneEnabled, planFourLaneAction } from './four-lane-runtime.mjs';
import { resolveEnvironmentTier, requiredGatesForTier } from './environment-profiles.mjs';

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

/**
 * #2621: plan CREATE_DRAFT_PR once #2620's advisory contract validation is
 * clean, or return an explicit no-action/fail-closed reason. Only reachable
 * in `advance`/`integrate` mode — `observe`/`disabled` never reach here
 * (planConservative returns before this runs) and `normalize` is reserved
 * for label/comment normalization, not PR creation. Returns null when the
 * caller supplied no contract evidence at all, so callers without #2620
 * evidence fall through to the existing routing logic unchanged.
 */
function planCreateDraftPr(snapshot, mode) {
  const contract = snapshot.issuePrContract;
  if (!contract || contract.status === 'missing') return null;
  if (!['advance', 'integrate'].includes(mode)) return null;

  // Checked before the generic invalid disposition: an unauthorized trigger
  // actor is itself why #2620's validation is not `ok`, so this branch
  // gives that specific, actionable reason instead of the same
  // contract_invalid every other validation failure produces.
  if (contract.actorAuthorized === false) return plan(snapshot, 'noop', 'contract_actor_unauthorized');
  if (contract.status !== 'valid') return plan(snapshot, 'noop', 'contract_invalid');
  if (!contract.headBranch || !contract.baseBranch) return plan(snapshot, 'noop', 'contract_branch_missing');
  if (contract.hasDiff === false) return plan(snapshot, 'noop', 'contract_diff_empty');
  if (contract.baseBranch === 'main') return plan(snapshot, 'noop', 'production_main_boundary');

  if (contract.existingPr) {
    return plan(snapshot, 'noop', 'existing_pr_reconciled', [
      {
        type: 'update_contract_comment',
        issue: snapshot.identity.taskIssue,
        rev: contract.rev,
        prUrl: contract.existingPr.url || null,
      },
    ]);
  }

  return plan(snapshot, 'create_draft_pr', 'contract_valid_ready_for_draft_pr', [
    {
      type: 'create_draft_pr',
      issue: snapshot.identity.taskIssue,
      headBranch: contract.headBranch,
      baseBranch: contract.baseBranch,
      expectedHeadSha: contract.headSha,
      expectedBaseSha: contract.baseSha,
      contractRev: contract.rev,
      // Carried through so buildDraftPrPlan can render the canonical PR
      // body (scripts/ci/pr_body_renderer.mjs) instead of a hand-built one.
      contractFields: contract.fields || null,
      deliveryProfile: contract.deliveryProfile || null,
    },
  ]);
}

/**
 * #2622 (revised design): plan ADMIT_ENVIRONMENT_PR once #2620's advisory
 * contract validation is clean, only in the dedicated `admit` mode — never
 * reachable from `advance`/`integrate`/`normalize`, so it can never change
 * the existing #2621 draft-PR-only behavior those modes already have.
 * Requires the contract's base branch to resolve to an implemented
 * auto-admission tier (sandbox or development); `main`/Production and any
 * not-yet-implemented tier (e.g. Transition) fall closed to a noop.
 */
function planAdmitEnvironmentPr(snapshot, mode) {
  const contract = snapshot.issuePrContract;
  if (!contract || contract.status === 'missing') return null;
  if (mode !== 'admit') return null;

  if (contract.actorAuthorized === false) return plan(snapshot, 'noop', 'contract_actor_unauthorized');
  if (contract.status !== 'valid') return plan(snapshot, 'noop', 'contract_invalid');
  if (!contract.headBranch || !contract.baseBranch) return plan(snapshot, 'noop', 'contract_branch_missing');
  if (contract.hasDiff === false) return plan(snapshot, 'noop', 'contract_diff_empty');
  if (contract.baseBranch === 'main') return plan(snapshot, 'noop', 'production_main_boundary');

  const environmentTier = resolveEnvironmentTier(contract.baseBranch);
  if (!environmentTier) return plan(snapshot, 'noop', 'environment_not_eligible_for_auto_admission');

  if (contract.existingPr) {
    return plan(snapshot, 'noop', 'existing_pr_reconciled', [
      {
        type: 'update_contract_comment',
        issue: snapshot.identity.taskIssue,
        rev: contract.rev,
        prUrl: contract.existingPr.url || null,
      },
    ]);
  }

  return plan(snapshot, 'admit_environment_pr', 'contract_valid_ready_for_environment_admission', [
    {
      type: 'admit_environment_pr',
      issue: snapshot.identity.taskIssue,
      headBranch: contract.headBranch,
      baseBranch: contract.baseBranch,
      expectedHeadSha: contract.headSha,
      expectedBaseSha: contract.baseSha,
      contractRev: contract.rev,
      contractFields: contract.fields || null,
      deliveryProfile: contract.deliveryProfile || null,
      environmentTier,
      requiredGates: requiredGatesForTier(environmentTier),
    },
  ]);
}

function planConservative(snapshot, policy = {}) {
  const mode = policy.mode || 'observe';
  if (!snapshot || snapshot.ambiguous) return plan(snapshot || { identity: {}, revision: 'missing' }, 'halt', 'ambiguous_or_missing_state');
  const mainPr = (snapshot.pullRequests || []).find((pr) => pr.state === 'open' && pr.base === 'main');
  if (mainPr) return plan(snapshot, 'human_decision', 'production_main_boundary');
  if (mode === 'disabled') return plan(snapshot, 'noop', 'routing_disabled');
  if (mode === 'observe') return plan(snapshot, 'observe', 'observe_only');

  const draftPrPlan = planCreateDraftPr(snapshot, mode);
  if (draftPrPlan) return draftPrPlan;

  const admitPrPlan = planAdmitEnvironmentPr(snapshot, mode);
  if (admitPrPlan) return admitPrPlan;

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
