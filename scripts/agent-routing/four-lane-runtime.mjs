/**
 * Config-gated four-lane operating model for #2639 / #2640.
 *
 * Horizontal lanes: pmo-engineering, implementation-operations, day2-operations
 * Vertical lane: administration-communications
 *
 * When fourLaneRuntime.enabled is false, callers must not use these helpers for
 * planning — the conservative serialized planner remains authoritative.
 */

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

/**
 * Resolve top-level lane states and nested delivery review phase.
 */
export function resolveOperatingLaneState(input = {}) {
  const events = input.events || [];
  const event = latestEvent(events);
  const implementationHandoff = findLatestMarker(events, ['IMPLEMENTATION HANDOFF']);
  const prReviewRequest = findLatestMarker(events, ['PR REVIEW REQUEST', 'CHATGPT HANDOFF']);
  const approved = findLatestMarker(events, ['APPROVED FOR INTEGRATION', 'CHATGPT RESPONSE']);
  const changesRequired = findLatestMarker(events, ['ADJUSTMENT']);
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
    if (!implementationHandoff && !prReviewRequest) {
      return { phase: 'none', implementationHandoffComplete: false };
    }
    const handoffComplete = Boolean(implementationHandoff);
    if (approved && (!changesRequired || String(approved.createdAt) >= String(changesRequired.createdAt || ''))) {
      if (closeout && String(closeout.createdAt) >= String(approved.createdAt || '')) {
        return { phase: 'administration-pending', implementationHandoffComplete: handoffComplete };
      }
      return { phase: 'integration-eligible', implementationHandoffComplete: handoffComplete };
    }
    if (changesRequired && (!approved || String(changesRequired.createdAt) > String(approved.createdAt || ''))) {
      return { phase: 'remediation-required', implementationHandoffComplete: handoffComplete };
    }
    if (prReviewRequest || implementationHandoff) {
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

  return {
    topology: {
      horizontal: [...HORIZONTAL_LANES],
      vertical: VERTICAL_LANE,
    },
    lanes: {
      'pmo-engineering': { status: pmoStatus },
      'implementation-operations': {
        status: implementationStatus,
        nestedReview,
        implementationHandoffComplete: nestedReview.implementationHandoffComplete,
        profile: input.profile || 'development',
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
 */
export function evaluateSuccessorEligibility({
  dependencyClass = 'none',
  predecessorComplete = true,
  operationalHold = null,
  administrationBlocks = false,
  nestedReviewPhase = 'none',
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
  if (dependencyClass === 'direct' || dependencyClass === 'stacked') {
    if (!predecessorComplete && nestedReviewPhase === 'none') {
      return { eligible: false, reason: 'direct_predecessor_incomplete' };
    }
    // Independent successor may proceed while prior task is review/admin pending.
    if (!predecessorComplete && ['review-pending', 'administration-pending', 'integration-eligible'].includes(nestedReviewPhase)) {
      return { eligible: true, reason: 'independent_while_prior_in_review_or_admin' };
    }
    if (!predecessorComplete) {
      return { eligible: false, reason: 'direct_predecessor_incomplete' };
    }
  }
  if (dependencyClass === 'collision') {
    return { eligible: false, reason: 'mutation_scope_collision' };
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
