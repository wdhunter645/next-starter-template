#!/usr/bin/env node
/**
 * Validate and construct `lgfc-workflow-health-event:v1` envelopes.
 * Pure helpers — no GitHub I/O, no authority. Work unit #2887 / parent #2680.
 */

import {
  ACTOR_COMPONENTS,
  BLOCKER_CLASSES,
  ENVELOPE_PHASES,
  ENVELOPE_REQUIRED_FIELDS,
  ENVELOPE_RESULTS,
  ENVELOPE_SCHEMA_VERSION,
  STAGE_IDS,
} from './event-inventory.mjs';

/**
 * @param {unknown} value
 * @returns {value is string}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * @param {object} event
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateEnvelope(event) {
  const errors = [];
  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return { ok: false, errors: ['envelope_not_an_object'] };
  }

  for (const field of ENVELOPE_REQUIRED_FIELDS) {
    if (!(field in event)) errors.push(`missing_field:${field}`);
  }

  if (event.schemaVersion !== ENVELOPE_SCHEMA_VERSION) {
    errors.push(`invalid_schemaVersion:${String(event.schemaVersion)}`);
  }
  if (!STAGE_IDS.includes(event.stage)) {
    errors.push(`invalid_stage:${String(event.stage)}`);
  }
  if (!ENVELOPE_PHASES.includes(event.phase)) {
    errors.push(`invalid_phase:${String(event.phase)}`);
  }
  if (!ENVELOPE_RESULTS.includes(event.result)) {
    errors.push(`invalid_result:${String(event.result)}`);
  }
  if (!ACTOR_COMPONENTS.includes(event.actorComponent)) {
    errors.push(`invalid_actorComponent:${String(event.actorComponent)}`);
  }
  if (event.blockerClass !== null && !BLOCKER_CLASSES.includes(event.blockerClass)) {
    errors.push(`invalid_blockerClass:${String(event.blockerClass)}`);
  }
  if (!isNonEmptyString(event.transactionId)) errors.push('invalid_transactionId');
  if (typeof event.sourceIssue !== 'number' || !Number.isInteger(event.sourceIssue) || event.sourceIssue < 1) {
    errors.push('invalid_sourceIssue');
  }
  if (!isNonEmptyString(event.occurredAt) || Number.isNaN(Date.parse(event.occurredAt))) {
    errors.push('invalid_occurredAt');
  }
  if (!isNonEmptyString(event.idempotencyKey)) errors.push('invalid_idempotencyKey');
  if (
    event.evidenceQuality !== 'deterministic' &&
    event.evidenceQuality !== 'unknown_evidence_missing'
  ) {
    errors.push(`invalid_evidenceQuality:${String(event.evidenceQuality)}`);
  }
  if (!event.evidence || typeof event.evidence !== 'object') {
    errors.push('invalid_evidence');
  } else {
    for (const key of ['channel', 'ref', 'marker']) {
      if (!isNonEmptyString(event.evidence[key]) && event.evidence[key] !== null) {
        errors.push(`invalid_evidence.${key}`);
      }
    }
  }
  if (
    event.nextExpectedAction !== null &&
    (typeof event.nextExpectedAction !== 'object' ||
      !isNonEmptyString(event.nextExpectedAction?.owner) ||
      !isNonEmptyString(event.nextExpectedAction?.action))
  ) {
    errors.push('invalid_nextExpectedAction');
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Build a complete envelope from a partial input. Unknown / nullish optionals
 * are normalized to the contract's null defaults. Does not throw — callers
 * must check `validateEnvelope` (or the returned `ok`) before ingest.
 *
 * @param {object} partial
 * @returns {{ ok: boolean, event: object|null, errors: string[] }}
 */
export function buildEnvelope(partial = {}) {
  const event = {
    schemaVersion: ENVELOPE_SCHEMA_VERSION,
    transactionId: partial.transactionId ?? null,
    sourceIssue: partial.sourceIssue ?? null,
    project: partial.project ?? null,
    lane: partial.lane ?? 'development',
    pr: partial.pr ?? null,
    candidateSha: partial.candidateSha ?? null,
    stage: partial.stage ?? null,
    phase: partial.phase ?? null,
    occurredAt: partial.occurredAt ?? null,
    actor: partial.actor ?? null,
    actorComponent: partial.actorComponent ?? null,
    result: partial.result ?? null,
    blockerClass: partial.blockerClass ?? null,
    nextExpectedAction: partial.nextExpectedAction ?? null,
    sloDeadline: partial.sloDeadline ?? null,
    idempotencyKey: partial.idempotencyKey ?? null,
    supersedes: partial.supersedes ?? null,
    evidence: partial.evidence
      ? {
          channel: partial.evidence.channel ?? null,
          ref: partial.evidence.ref ?? null,
          marker: partial.evidence.marker ?? null,
        }
      : { channel: null, ref: null, marker: null },
    evidenceQuality: partial.evidenceQuality ?? null,
  };

  const validation = validateEnvelope(event);
  return { ok: validation.ok, event: validation.ok ? event : null, errors: validation.errors };
}

/**
 * Stable transaction identity used across adapters for one work unit.
 * @param {number} sourceIssue
 * @param {string|number|null} [workUnitId]
 */
export function transactionIdFor(sourceIssue, workUnitId = null) {
  return workUnitId == null || workUnitId === ''
    ? `issue-${sourceIssue}`
    : `issue-${sourceIssue}::wu-${workUnitId}`;
}
