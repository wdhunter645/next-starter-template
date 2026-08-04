#!/usr/bin/env node

// Progressive non-production environment admission (#2622, revised design).
//
// A base branch resolves to exactly one auto-admission environment tier.
// Gate coverage increases monotonically: Sandbox ⊂ Development ⊂
// Transition ⊂ Production. Only Sandbox and Development are implemented
// here (Stage A); `main` never resolves to a tier, so it is never eligible
// for automatic admission through this path.

const SANDBOX_BASE_PATTERN = /^sandbox\//;

/**
 * @param {string} baseBranch
 * @returns {'sandbox'|'development'|null} null means not eligible for
 *   automatic non-production admission (this covers `main`/Production).
 */
export function resolveEnvironmentTier(baseBranch = '') {
  if (!baseBranch || baseBranch === 'main') return null;
  if (SANDBOX_BASE_PATTERN.test(baseBranch)) return 'sandbox';
  return 'development';
}

// Each gate name maps to inline execution the controller performs itself,
// inside its own workflow_dispatch run, reusing the same scripts/actions
// the existing pull_request-triggered gates use — never a second, weaker
// implementation (docs/reference/ci/issue-pr-contract.md; #2622 comment
// 5131296090).
export const REQUIRED_INLINE_GATES = Object.freeze({
  sandbox: Object.freeze(['secret_scan']),
  development: Object.freeze(['secret_scan', 'quality']),
});

export function requiredGatesForTier(tier) {
  if (!Object.hasOwn(REQUIRED_INLINE_GATES, tier)) return null;
  return [...REQUIRED_INLINE_GATES[tier]];
}

const TIER_TITLE_LABEL = Object.freeze({
  sandbox: 'Sandbox',
  development: 'Development',
});

export function environmentTitleLabel(tier) {
  if (!Object.hasOwn(TIER_TITLE_LABEL, tier)) return tier;
  return TIER_TITLE_LABEL[tier];
}

/**
 * Deterministic environment-approval marker recorded on the source Issue when
 * every required inline gate for the tier has passed (#2622). Null for any
 * tier that is not an implemented auto-admission target.
 */
export function environmentAdmissionApproval(tier) {
  // Own-property only — inherited Object.prototype keys must not become labels.
  if (!Object.hasOwn(TIER_TITLE_LABEL, tier)) return null;
  return `APPROVED FOR ${TIER_TITLE_LABEL[tier].toUpperCase()} ADMISSION`;
}

/** Stable equality for ordered required-gate lists. */
export function sameRequiredGates(actual = [], expected = []) {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
  if (actual.length !== expected.length) return false;
  return actual.every((gate, index) => gate === expected[index]);
}
