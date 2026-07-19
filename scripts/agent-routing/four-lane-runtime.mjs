/**
 * Config-gated four-lane operating model for #2639 / #2640.
 *
 * Horizontal lanes: pmo-engineering, implementation-operations, day2-operations
 * Vertical lane: administration-communications
 *
 * When fourLaneRuntime.enabled is false, callers must not use these helpers for
 * planning — the conservative serialized planner remains authoritative.
 */

import {
  evaluateProfileTransition,
  gateActionByPromotionProfile,
  resolvePromotionProfileState,
} from './promotion-profile-matrix.mjs';

export {
  ALLOWED_PROFILE_TRANSITIONS,
  PROMOTION_PROFILES,
  PROHIBITED_PROFILE_BYPASSES,
  assertProfileTransition,
  evaluateProfileTransition,
  gateActionByPromotionProfile,
  listAllowedTransitions,
  listProhibitedBypasses,
  normalizePromotionProfile,
  resolvePromotionProfileState,
} from './promotion-profile-matrix.mjs';

export const HORIZONTAL_LANES = Object.freeze([
  'pmo-engineering',
  'implementation-operations',
  'day2-operations',
]);

export const VERTICAL_LANE = 'administration-communications';

export const OPERATING_LANES = Object.freeze([...HORIZONTAL_LANES, VERTICAL_LANE]);

export const FOUR_LANE_EVENT_MARKERS = Object.freeze([
  'PROBLEM FOUND',
  'GUIDANCE',
  'ADJUSTMENT',
  'HOLD',
  'PLAN CHANGE REQUIRED',
  'RESUME',
  'IMPLEMENTATION HANDOFF',
  'PR REVIEW REQUEST',
  'APPROVED FOR INTEGRATION',
  'PROMOTION CANDIDATE READY',
  'PRODUCTION GO',
  'OPERATIONAL INCIDENT',
  'RECOVERY VERIFIED',
  'CLOSEOUT',
  'LOCAL CURSOR RESUME',
  'CURSOR ACK',
  'CURSOR ASSIGNMENT',
  'CURSOR STATUS',
  'CURSOR COMPLETE',
  'CHATGPT HANDOFF',
  'CHATGPT RESPONSE',
  'CHATGPT CLOSEOUT',
]);

export const DEPENDENCY_CLASSES = Object.freeze([
  'none',
  'direct',
  'stacked',
  'collision',
  'protected-stop',
  'explicit-hold',
  'administrative-only',
]);

export function isFourLaneEnabled(policy = {}) {
  return policy.fourLaneRuntime?.enabled === true;
}

function latestEvent(events = []) {
  return [...events]
    .sort((a, b) => {
      const time = String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
      if (time !== 0) return time;
      return Number(a.id || 0) - Number(b.id || 0);
    })
    .at(-1) || null;
}

function findLatestMarker(events = [], markers = []) {
  const set = new Set(markers);
  return [...events]
    .filter((event) => set.has(event.marker))
    .sort((a, b) => {
      const time = String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
      if (time !== 0) return time;
      return Number(a.id || 0) - Number(b.id || 0);
    })
    .at(-1) || null;
}

const APPROVAL_DISPOSITIONS = new Set([
  'approved-for-integration',
  'APPROVED FOR INTEGRATION',
]);

const REVIEW_REQUEST_DISPOSITIONS = new Set([
  'pr-review-request',
  'PR REVIEW REQUEST',
]);

const CHANGES_REQUIRED_DISPOSITIONS = new Set([
  'changes-required',
  'CHANGES REQUIRED',
  'adjustment',
  'ADJUSTMENT',
  'hold',
  'HOLD',
  'guidance',
  'GUIDANCE',
  'wait',
]);

/**
 * Fail-closed typed disposition parsing.
 * Generic legacy CHATGPT RESPONSE / CHATGPT HANDOFF markers never authorize
 * approval or review-request unless an explicit disposition field is present.
 */
export function parseTypedDisposition(event = null) {
  if (!event || !event.marker) {
    return { kind: 'none', trusted: false, reason: 'missing_event' };
  }
  const disposition = event.disposition || event.requestedDisposition || null;

  if (event.marker === 'APPROVED FOR INTEGRATION') {
    return { kind: 'approved-for-integration', trusted: true, reason: 'typed_marker', event };
  }
  if (event.marker === 'PR REVIEW REQUEST') {
    return { kind: 'pr-review-request', trusted: true, reason: 'typed_marker', event };
  }
  if (event.marker === 'ADJUSTMENT' || event.marker === 'HOLD' || event.marker === 'GUIDANCE' || event.marker === 'PLAN CHANGE REQUIRED') {
    return { kind: 'changes-required', trusted: true, reason: 'typed_marker', event, disposition: event.marker };
  }

  if (event.marker === 'CHATGPT RESPONSE') {
    if (APPROVAL_DISPOSITIONS.has(disposition)) {
      return { kind: 'approved-for-integration', trusted: true, reason: 'legacy_adapter_typed_disposition', event };
    }
    if (CHANGES_REQUIRED_DISPOSITIONS.has(disposition)) {
      return { kind: 'changes-required', trusted: true, reason: 'legacy_adapter_typed_disposition', event, disposition };
    }
    return { kind: 'untyped-response', trusted: false, reason: 'generic_chatgpt_response_fail_closed', event };
  }

  if (event.marker === 'CHATGPT HANDOFF') {
    if (REVIEW_REQUEST_DISPOSITIONS.has(disposition)) {
      return { kind: 'pr-review-request', trusted: true, reason: 'legacy_adapter_typed_disposition', event };
    }
    return { kind: 'untyped-handoff', trusted: false, reason: 'generic_chatgpt_handoff_fail_closed', event };
  }

  return { kind: 'other', trusted: false, reason: 'not_disposition_event', event };
}

function findLatestTyped(events = [], kinds = []) {
  const wanted = new Set(kinds);
  return [...events]
    .map((event) => ({ event, parsed: parseTypedDisposition(event) }))
    .filter(({ parsed }) => parsed.trusted && wanted.has(parsed.kind))
    .sort((a, b) => {
      const time = String(a.event.createdAt || '').localeCompare(String(b.event.createdAt || ''));
      if (time !== 0) return time;
      return Number(a.event.id || 0) - Number(b.event.id || 0);
    })
    .at(-1) || null;
}

/**
 * Resolve top-level lane states and nested delivery review phase.
 */
export function resolveOperatingLaneState(input = {}) {
  const events = input.events || [];
  const event = latestEvent(events);
  const implementationHandoff = findLatestMarker(events, ['IMPLEMENTATION HANDOFF']);
  const typedReview = findLatestTyped(events, ['pr-review-request']);
  const typedApproval = findLatestTyped(events, ['approved-for-integration']);
  const typedChanges = findLatestTyped(events, ['changes-required']);
  const closeout = findLatestMarker(events, ['CLOSEOUT', 'CHATGPT CLOSEOUT']);
  const operationalIncident = findLatestMarker(events, ['OPERATIONAL INCIDENT']);
  const recoveryVerified = findLatestMarker(events, ['RECOVERY VERIFIED']);
  const problemFound = findLatestMarker(events, ['PROBLEM FOUND']);
  const resume = findLatestMarker(events, ['RESUME', 'LOCAL CURSOR RESUME']);
  const hold = findLatestMarker(events, ['HOLD']);

  const projectGo = input.projectGo === true || input.project?.lifecycle === 'active' || input.project?.lifecycle === 'launched';
  const adminDefect = input.administration?.substantiveDefect === true
    ? {
        code: input.administration.defectCode || 'substantive_defect',
        detail: input.administration.defectDetail || 'explicit substantive defect',
      }
    : null;

  const nestedReview = (() => {
    const reviewPendingSignal = Boolean(implementationHandoff || typedReview);
    if (!reviewPendingSignal) {
      return { phase: 'none', implementationHandoffComplete: false };
    }
    const handoffComplete = Boolean(implementationHandoff);
    const approvedAt = typedApproval?.event?.createdAt || '';
    const changesAt = typedChanges?.event?.createdAt || '';

    if (typedApproval && (!typedChanges || String(approvedAt) >= String(changesAt))) {
      if (closeout && String(closeout.createdAt) >= String(approvedAt)) {
        return { phase: 'administration-pending', implementationHandoffComplete: handoffComplete };
      }
      return { phase: 'integration-eligible', implementationHandoffComplete: handoffComplete };
    }
    if (typedChanges && (!typedApproval || String(changesAt) > String(approvedAt))) {
      return { phase: 'remediation-required', implementationHandoffComplete: handoffComplete };
    }
    if (typedReview || implementationHandoff) {
      return { phase: 'review-pending', implementationHandoffComplete: handoffComplete };
    }
    return { phase: 'none', implementationHandoffComplete: false };
  })();

  const assessmentHoldActive = Boolean(
    input.operationalHold?.active === true
      || (operationalIncident && (!recoveryVerified || String(operationalIncident.createdAt) > String(recoveryVerified.createdAt || '')))
      || (hold && (!resume || String(hold.createdAt) > String(resume.createdAt || ''))),
  );

  const day2Status = assessmentHoldActive
    ? (input.operationalHold?.severityClassified === true ? 'incident-active' : 'assessment-active')
    : recoveryVerified && operationalIncident
      ? 'recovered'
      : 'healthy';

  const pmoStatus = !projectGo
    ? 'pre-go'
    : assessmentHoldActive
      ? 'incident-support-only'
      : 'project-launched';

  const implementationStatus = assessmentHoldActive && input.operationalHold?.scope !== 'incident-task'
    ? 'held'
    : nestedReview.phase === 'remediation-required'
      ? 'remediation'
      : nestedReview.phase === 'review-pending' || nestedReview.phase === 'administration-pending' || nestedReview.phase === 'integration-eligible'
        ? 'review-or-integration'
        : input.task?.state === 'active'
          ? 'implementation-active'
          : 'idle';

  const administrationStatus = adminDefect
    ? 'blocking-defect'
    : nestedReview.phase === 'administration-pending'
      ? 'closeout-pending'
      : 'non-blocking';

  const planAdjustment = problemFound && (!resume || String(problemFound.createdAt) > String(resume.createdAt || ''))
    ? {
        active: true,
        marker: problemFound.marker,
        awaiting: findLatestMarker(events, ['GUIDANCE', 'ADJUSTMENT', 'PLAN CHANGE REQUIRED']) ? 'resume' : 'decision',
      }
    : { active: false, marker: null, awaiting: null };

  const promotionProfile = resolvePromotionProfileState(input);

  return {
    topology: {
      horizontal: [...HORIZONTAL_LANES],
      vertical: VERTICAL_LANE,
    },
    promotionProfile,
    lanes: {
      'pmo-engineering': { status: pmoStatus },
      'implementation-operations': {
        status: implementationStatus,
        nestedReview,
        implementationHandoffComplete: nestedReview.implementationHandoffComplete,
        profile: promotionProfile.current === 'none' ? (input.profile || 'development') : promotionProfile.current,
      },
      'day2-operations': { status: day2Status },
      'administration-communications': {
        status: administrationStatus,
        substantiveDefect: adminDefect,
        blocksDelivery: Boolean(adminDefect),
      },
    },
    operationalHold: {
      active: assessmentHoldActive,
      scope: input.operationalHold?.scope || (assessmentHoldActive ? 'assessment' : 'none'),
      severityClassified: input.operationalHold?.severityClassified === true,
      preservedState: input.operationalHold?.preservedState || null,
      incidentKey: input.operationalHold?.incidentKey || operationalIncident?.incidentKey || null,
      releaseAuthorized: input.operationalHold?.releaseAuthorized === true
        || (recoveryVerified && operationalIncident && String(recoveryVerified.createdAt) >= String(operationalIncident.createdAt || '')),
    },
    planAdjustment,
    latestEvent: event,
  };
}

/**
 * Successor eligibility under four-lane rules.
 * administrative-only never blocks. Operational assessment hold blocks delivery claims.
 * direct/stacked remain blocked until the predecessor completion condition is satisfied;
 * review/admin pending alone never implies independence.
 */
export function evaluateSuccessorEligibility({
  dependencyClass = 'direct',
  predecessorComplete = true,
  operationalHold = null,
  administrationBlocks = false,
  independentAuthority = false,
} = {}) {
  if (administrationBlocks) {
    return { eligible: false, reason: 'administration_substantive_defect' };
  }
  if (operationalHold?.active && ['assessment', 'targeted-project'].includes(operationalHold.scope || 'assessment')) {
    return { eligible: false, reason: 'operational_assessment_hold' };
  }
  if (dependencyClass === 'administrative-only') {
    return { eligible: true, reason: 'administrative_only_non_blocking' };
  }
  if (dependencyClass === 'protected-stop' || dependencyClass === 'explicit-hold') {
    return { eligible: false, reason: `dependency_${dependencyClass}` };
  }
  if (dependencyClass === 'collision') {
    return { eligible: false, reason: 'mutation_scope_collision' };
  }
  if (dependencyClass === 'direct' || dependencyClass === 'stacked') {
    if (independentAuthority === true) {
      return { eligible: true, reason: 'explicit_independent_authority' };
    }
    if (!predecessorComplete) {
      return { eligible: false, reason: 'direct_predecessor_incomplete' };
    }
  }
  if (dependencyClass === 'none') {
    return { eligible: true, reason: 'explicit_independent_class' };
  }
  return { eligible: true, reason: 'eligible' };
}

/**
 * Plan four-lane actions. Never authorizes main merge.
 */
export function planFourLaneAction(snapshot, policy = {}) {
  const lanes = snapshot.operatingLanes;
  if (!lanes) {
    return { class: 'halt', reason: 'four_lane_state_missing', mutations: [] };
  }

  // Fail closed on prohibited promotion-profile bypasses before any delivery action.
  const requestedProfile = policy.targetProfile || snapshot.requestedProfile || lanes.promotionProfile?.requested;
  if (requestedProfile) {
    const profileGate = gateActionByPromotionProfile({
      currentProfile: lanes.promotionProfile?.current || snapshot.profile || 'none',
      targetProfile: requestedProfile,
      actionClass: 'profile_transition',
    });
    if (profileGate.gated) {
      return {
        class: 'halt',
        reason: profileGate.reason,
        mutations: [],
        promotionProfile: profileGate.decision,
      };
    }
  }
  if (policy.targetProfile && policy.currentProfile) {
    const explicit = evaluateProfileTransition(policy.currentProfile, policy.targetProfile);
    if (!explicit.allowed) {
      return {
        class: 'halt',
        reason: explicit.code,
        mutations: [],
        promotionProfile: explicit,
      };
    }
  }

  const hold = lanes.operationalHold;
  if (hold?.active && !hold.releaseAuthorized) {
    if (policy.mode === 'observe') {
      return { class: 'observe', reason: 'operational_hold_observe', mutations: [] };
    }
    if (hold.severityClassified !== true) {
      return {
        class: 'operational_assessment',
        reason: 'assessment_hold_active',
        mutations: [],
      };
    }
    if (snapshot.incidentAutoRemediation?.safe === true && snapshot.incidentAutoRemediation?.authorized === true) {
      return {
        class: 'operational_auto_remediation',
        reason: 'safe_deterministic_auto_remediation',
        mutations: [{
          type: 'rerun_failed_job',
          runId: snapshot.incidentAutoRemediation.runId,
          reversible: true,
          evidenceBacked: true,
        }],
      };
    }
    return {
      class: 'operational_incident_route',
      reason: 'incident_requires_day2_or_implementation',
      mutations: [],
    };
  }

  if (hold?.active && hold.releaseAuthorized) {
    return {
      class: 'operational_hold_release',
      reason: 'evidence_backed_hold_release',
      mutations: [{
        type: 'post_comment',
        marker: 'RESUME',
        issue: snapshot.identity?.taskIssue,
        preserveClaims: true,
      }],
    };
  }

  if (lanes.planAdjustment?.active && lanes.planAdjustment.awaiting === 'decision') {
    return { class: 'plan_adjustment_route', reason: 'problem_found_awaits_decision', mutations: [] };
  }

  if (lanes.lanes['administration-communications']?.blocksDelivery) {
    return { class: 'halt', reason: 'administration_substantive_defect', mutations: [] };
  }

  const nested = lanes.lanes['implementation-operations']?.nestedReview;
  if (nested?.phase === 'review-pending') {
    return { class: 'nested_pr_review', reason: 'implementation_handoff_review_pending', mutations: [] };
  }
  if (nested?.phase === 'remediation-required') {
    return {
      class: 'nested_review_remediation',
      reason: 'changes_required_bounded_remediation',
      mutations: [{
        type: 'post_comment',
        marker: 'LOCAL CURSOR RESUME',
        issue: snapshot.identity?.taskIssue,
      }],
    };
  }
  if (nested?.phase === 'integration-eligible' && policy.mode === 'integrate') {
    const projectPr = (snapshot.pullRequests || []).find(
      (pr) => pr.state === 'open' && pr.base === snapshot.identity?.projectBranch,
    );
    if (projectPr?.mergeable) {
      return {
        class: 'integrate_non_main',
        reason: 'approved_nested_review_integration',
        mutations: [{ type: 'merge_pr', pr: projectPr.number, base: projectPr.base }],
      };
    }
  }

  if (lanes.lanes['pmo-engineering']?.status === 'pre-go') {
    return { class: 'noop', reason: 'pmo_pre_go', mutations: [] };
  }

  return { class: 'noop', reason: 'no_four_lane_action', mutations: [] };
}

/**
 * Preserve project delivery state for later resume during operational preemption.
 */
export function preserveDeliveryStateForHold(snapshot, incident = {}) {
  return {
    projectIssue: snapshot.identity?.projectIssue ?? null,
    taskIssue: snapshot.identity?.taskIssue ?? null,
    projectBranch: snapshot.identity?.projectBranch ?? null,
    revision: snapshot.revision ?? null,
    activeClaims: [...(snapshot.activeClaims || [])],
    consumedEventIds: [...(snapshot.consumedEventIds || [])],
    watermarks: {
      latestEventId: snapshot.latestEvent?.id ?? null,
      latestEventMarker: snapshot.latestEvent?.marker ?? null,
    },
    incidentKey: incident.incidentKey || null,
    preservedAt: incident.preservedAt || new Date().toISOString(),
  };
}

export function releaseOperationalHold({ hold, triage = {} } = {}) {
  if (!hold?.active) {
    return { released: false, reason: 'hold_not_active' };
  }
  if (triage.falsePositive === true || triage.lowImpact === true || triage.contained === true || triage.recoveryVerified === true) {
    return {
      released: true,
      reason: triage.falsePositive
        ? 'false_positive'
        : triage.lowImpact
          ? 'low_impact'
          : triage.contained
            ? 'contained'
            : 'recovery_verified',
      restoreFrom: hold.preservedState || null,
    };
  }
  return { released: false, reason: 'release_evidence_insufficient' };
}
