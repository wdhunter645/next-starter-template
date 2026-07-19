/**
 * Deterministic promotion-profile transition matrix for #2639.
 *
 * Profiles: sandbox -> development -> promotion-candidate -> production -> day2-operations
 *
 * Encodes the canonical allowed/prohibited transitions from
 * docs/reference/operations/operating-lanes-and-promotion-profiles.md.
 * Does not enable fourLaneRuntime by itself — callers must still respect
 * config gating.
 */

export const PROMOTION_PROFILES = Object.freeze([
  'sandbox',
  'development',
  'promotion-candidate',
  'production',
  'day2-operations',
]);

/** Canonical display labels for reports and handoffs. */
export const PROMOTION_PROFILE_LABELS = Object.freeze({
  sandbox: 'Sandbox',
  development: 'Development',
  'promotion-candidate': 'Promotion Candidate',
  production: 'Production',
  'day2-operations': 'Day-2 Operations',
});

/**
 * Allowed directed transitions (from -> to[]).
 * Entry from PMO planning is modeled as from=null / 'none'.
 */
export const ALLOWED_PROFILE_TRANSITIONS = Object.freeze({
  none: Object.freeze(['sandbox', 'development']),
  sandbox: Object.freeze(['development']),
  development: Object.freeze(['promotion-candidate']),
  'promotion-candidate': Object.freeze(['development', 'production']),
  production: Object.freeze(['day2-operations']),
  'day2-operations': Object.freeze(['development', 'promotion-candidate']),
});

/**
 * Explicit prohibited bypasses that must fail closed even if a caller invents
 * an alternate edge. Kept as an 8-edge deny list covering the common skips.
 */
export const PROHIBITED_PROFILE_BYPASSES = Object.freeze([
  Object.freeze(['sandbox', 'promotion-candidate']),
  Object.freeze(['sandbox', 'production']),
  Object.freeze(['sandbox', 'day2-operations']),
  Object.freeze(['development', 'production']),
  Object.freeze(['development', 'day2-operations']),
  Object.freeze(['none', 'promotion-candidate']),
  Object.freeze(['none', 'production']),
  Object.freeze(['none', 'day2-operations']),
]);

export function normalizePromotionProfile(profile) {
  if (profile == null || profile === '' || profile === 'none') return 'none';
  const raw = String(profile).trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
  const aliases = {
    sandbox: 'sandbox',
    development: 'development',
    'promotion-candidate': 'promotion-candidate',
    'promotioncandidate': 'promotion-candidate',
    production: 'production',
    'day-2': 'day2-operations',
    'day-2-operations': 'day2-operations',
    'day2': 'day2-operations',
    'day2-operations': 'day2-operations',
  };
  return aliases[raw] || null;
}

export function isKnownPromotionProfile(profile) {
  if (profile === null) return false;
  const normalized = normalizePromotionProfile(profile);
  return normalized === 'none' || PROMOTION_PROFILES.includes(normalized);
}

function edgeKey(from, to) {
  return `${from}->${to}`;
}

const prohibitedSet = new Set(
  PROHIBITED_PROFILE_BYPASSES.map(([from, to]) => edgeKey(from, to)),
);

/**
 * Evaluate whether a profile transition is allowed.
 * Fail closed on unknown profiles and on any prohibited bypass.
 */
export function evaluateProfileTransition(fromProfile, toProfile, { reason = null } = {}) {
  const from = normalizePromotionProfile(fromProfile);
  const to = normalizePromotionProfile(toProfile);

  // normalizePromotionProfile returns null for unrecognized non-empty strings.
  if (from === null || to === null) {
    return {
      allowed: false,
      code: 'unknown_profile',
      from,
      to,
      reason: reason || 'unknown promotion profile',
    };
  }
  if (to === 'none') {
    return {
      allowed: false,
      code: 'invalid_target_profile',
      from,
      to,
      reason: reason || 'target profile cannot be none',
    };
  }
  if (from === to) {
    return {
      allowed: true,
      code: 'noop_same_profile',
      from,
      to,
      reason: reason || 'already at target profile',
    };
  }
  if (prohibitedSet.has(edgeKey(from, to))) {
    return {
      allowed: false,
      code: 'prohibited_bypass',
      from,
      to,
      reason: reason || `prohibited bypass ${from} -> ${to}`,
    };
  }
  const allowedTargets = ALLOWED_PROFILE_TRANSITIONS[from] || [];
  if (!allowedTargets.includes(to)) {
    return {
      allowed: false,
      code: 'transition_not_allowed',
      from,
      to,
      reason: reason || `transition ${from} -> ${to} is not in the allowed matrix`,
    };
  }
  return {
    allowed: true,
    code: 'allowed',
    from,
    to,
    reason: reason || `allowed transition ${from} -> ${to}`,
  };
}

export function assertProfileTransition(fromProfile, toProfile, options = {}) {
  const result = evaluateProfileTransition(fromProfile, toProfile, options);
  if (!result.allowed) {
    const error = new Error(result.reason);
    error.code = result.code;
    error.from = result.from;
    error.to = result.to;
    throw error;
  }
  return result;
}

/**
 * Resolve current promotion-profile state for a task/snapshot input.
 * Prefers explicit input.profile / input.promotionProfile; otherwise infers
 * from typed communication markers when present.
 *
 * Unknown non-empty raw profile strings fail closed: they never become a live
 * lane profile value.
 */
export function resolvePromotionProfileState(input = {}) {
  const rawExplicit = input.promotionProfile ?? input.profile;
  const hasRawExplicit = rawExplicit != null && String(rawExplicit).trim() !== '';
  const explicit = normalizePromotionProfile(rawExplicit);
  const unknownRawProfile = hasRawExplicit && explicit === null;
  const events = input.events || [];

  const has = (markers) => events.some((event) => markers.includes(event.marker));
  const inferred = (() => {
    if (unknownRawProfile) return 'none';
    if (has(['OPERATIONAL INCIDENT', 'RECOVERY VERIFIED']) && has(['PRODUCTION GO', 'CLOSEOUT', 'CHATGPT CLOSEOUT'])) {
      return 'day2-operations';
    }
    if (has(['PRODUCTION GO'])) return 'production';
    if (has(['PROMOTION CANDIDATE READY'])) return 'promotion-candidate';
    if (has(['IMPLEMENTATION HANDOFF', 'PR REVIEW REQUEST', 'APPROVED FOR INTEGRATION', 'LOCAL CURSOR RESUME', 'CURSOR ACK'])) {
      return 'development';
    }
    if (input.sandboxAuthorized === true || explicit === 'sandbox') return 'sandbox';
    return 'none';
  })();

  const current = (!unknownRawProfile && explicit && explicit !== 'none') ? explicit : inferred;
  const requestedRaw = input.requestedProfile ?? input.targetProfile;
  const requested = normalizePromotionProfile(requestedRaw);
  const unknownRequested = requestedRaw != null && String(requestedRaw).trim() !== '' && requested === null;
  const transition = !unknownRawProfile && !unknownRequested && requested && requested !== 'none'
    ? evaluateProfileTransition(current === 'none' && explicit === 'none' ? 'none' : current, requested)
    : null;

  return {
    profiles: [...PROMOTION_PROFILES],
    current,
    label: PROMOTION_PROFILE_LABELS[current] || current,
    requested: requested && requested !== 'none' ? requested : null,
    transition,
    unknownRawProfile,
    unknownRequestedProfile: unknownRequested,
    rawProfile: unknownRawProfile ? String(rawExplicit) : null,
    gates: {
      requiresPromotionCandidateBeforeProduction: true,
      automaticMainMergeProhibited: true,
      failClosedOnUnknownProfile: true,
    },
  };
}

/**
 * Gate a planned action that would move or claim work under a target profile.
 * Returns a planner-friendly halt when the transition is prohibited.
 */
export function gateActionByPromotionProfile({
  currentProfile = 'none',
  targetProfile = null,
  actionClass = 'noop',
} = {}) {
  if (!targetProfile) {
    return { gated: false, actionClass, reason: 'no_target_profile' };
  }
  const decision = evaluateProfileTransition(currentProfile, targetProfile);
  if (decision.allowed) {
    return { gated: false, actionClass, reason: decision.code, decision };
  }
  return {
    gated: true,
    actionClass: 'halt',
    reason: decision.code,
    decision,
    mutations: [],
  };
}

export function listProhibitedBypasses() {
  return PROHIBITED_PROFILE_BYPASSES.map(([from, to]) => ({ from, to, edge: edgeKey(from, to) }));
}

export function listAllowedTransitions() {
  return Object.entries(ALLOWED_PROFILE_TRANSITIONS).flatMap(([from, targets]) =>
    targets.map((to) => ({ from, to, edge: edgeKey(from, to) })),
  );
}
