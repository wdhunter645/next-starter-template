#!/usr/bin/env node
/**
 * Map #2677 deterministic handoff-controller observability / transaction
 * kinds onto cumulative lane evidence event drafts. Pure mapping only —
 * never posts to GitHub, never merges, never invents approval or Production
 * authority. Work unit #2884 / parent #2678.
 *
 * Transition kinds mirror docs/reference/ci/agent-routing-controller-contract.md
 * (component/deterministic-handoff-controller). This module deliberately does
 * not import that branch so cumulative-lane-evidence can integrate without
 * absorbing the full controller tree.
 */

/** @type {readonly string[]} */
export const CONTROLLER_TRANSITION_KINDS = Object.freeze([
  'handoff_received',
  'evidence_complete',
  'disposition',
  'resume',
  'integration',
  'verification',
  'closeout',
  'successor_activation',
  'duplicate_suppression',
  'blocker',
  'escalation',
  'reconciliation_scan',
  'mutation_disabled',
]);

const KIND_TO_TRANSITION = Object.freeze({
  handoff_received: 'enter',
  evidence_complete: 'progress',
  disposition: 'progress',
  resume: 'resume',
  integration: 'progress',
  verification: 'progress',
  closeout: 'closeout',
  successor_activation: 'progress',
  duplicate_suppression: 'progress',
  blocker: 'hold',
  escalation: 'hold',
  reconciliation_scan: 'progress',
  mutation_disabled: 'hold',
});

const KIND_TO_RESULT = Object.freeze({
  handoff_received: 'pass',
  evidence_complete: 'pass',
  disposition: 'pass',
  resume: 'pass',
  integration: 'pass',
  verification: 'pass',
  closeout: 'pass',
  successor_activation: 'pass',
  duplicate_suppression: 'deferred',
  blocker: 'blocked',
  escalation: 'blocked',
  reconciliation_scan: 'pass',
  mutation_disabled: 'deferred',
});

/**
 * Controller kinds that are administrative/diagnostic residue for in-lane
 * work. They must not halt safe Development coding/testing by themselves.
 */
export const ADMINISTRATIVE_CONTROLLER_KINDS = Object.freeze([
  'duplicate_suppression',
  'reconciliation_scan',
  'mutation_disabled',
  'handoff_received',
  'evidence_complete',
  'resume',
]);

/**
 * @param {{
 *   kind: string,
 *   outcome?: string,
 *   sourceIssue: number,
 *   workUnitId: string,
 *   idempotencyKey: string,
 *   lane?: string,
 *   actorRole?: string,
 *   timestamp?: string,
 *   candidateSha?: string|null,
 *   evidenceRefs?: object[],
 *   protectedStops?: string[],
 *   details?: object,
 * }} params
 * @returns {{ ok: boolean, event?: object, errors: string[], administrativeResidue: boolean }}
 */
export function buildEventDraftFromControllerTransaction(params = {}) {
  const {
    kind,
    outcome,
    sourceIssue,
    workUnitId,
    idempotencyKey,
    lane = 'development',
    actorRole = 'deterministic_ci',
    timestamp = new Date().toISOString(),
    candidateSha = null,
    evidenceRefs = [],
    protectedStops = [],
    details = {},
  } = params;

  const errors = [];
  if (!CONTROLLER_TRANSITION_KINDS.includes(kind)) {
    errors.push(`unsupported_controller_kind:${kind}`);
  }
  if (!sourceIssue || !workUnitId || !idempotencyKey) {
    errors.push('missing_identity:sourceIssue|workUnitId|idempotencyKey');
  }
  if (errors.length) return { ok: false, errors, administrativeResidue: false };

  const resultFromOutcome =
    outcome === 'fail' || outcome === 'failed'
      ? 'fail'
      : outcome === 'blocked'
        ? 'blocked'
        : KIND_TO_RESULT[kind];

  const event = {
    schemaVersion: 'lgfc-cumulative-evidence:v1',
    idempotencyKey,
    sourceIssue,
    workUnitId,
    lane,
    transition: KIND_TO_TRANSITION[kind],
    candidateSha,
    actorRole,
    actor: 'agent-routing-controller',
    timestamp,
    result: resultFromOutcome,
    evidenceRefs,
    supersedes: null,
    protectedStops: Array.isArray(protectedStops) ? protectedStops : [],
    nextExpectedTransition: kind === 'closeout' ? null : 'progress',
    summary: `Controller transaction ${kind}` + (outcome ? ` (${outcome})` : ''),
    laneFields: {
      controllerKind: kind,
      controllerOutcome: outcome || null,
      controllerDetails: details,
      // Development exit matrix fields are intentionally incomplete here —
      // controller progress events are not lane-exit packages. Callers that
      // intend exit/closeout must supply a complete laneFields object.
      sourceIssue,
      objective: details.objective || `controller:${kind}`,
      allowlist: details.allowlist || [],
      implementationSummary: details.implementationSummary || `Mapped from #2677 ${kind}`,
      verification: details.verification || { controllerKind: kind },
      reviewDispositions: details.reviewDispositions || 'controller-mapped; not an approval',
      limitationsAndRollback: details.limitationsAndRollback || 'disable controller adapter; retain append-only history',
      componentCandidate: details.componentCandidate || null,
    },
  };

  return {
    ok: true,
    event,
    errors: [],
    administrativeResidue: ADMINISTRATIVE_CONTROLLER_KINDS.includes(kind),
  };
}
