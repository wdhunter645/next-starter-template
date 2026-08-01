#!/usr/bin/env node
/**
 * Deterministic transaction materializer for workflow-health observability.
 * Derives stage, owner, age, blocker, next action, and evidence quality from
 * ingested envelopes. Derived state is a read-only view — it never creates
 * authority, approves work, or mutates GitHub. Work unit #2887 / parent #2680.
 */

import { ACTOR_COMPONENTS, REQUIRED_STAGE_IDS, STAGES } from './event-inventory.mjs';
import { ingestEvents } from './ingest.mjs';

const STAGE_ORDER = new Map(REQUIRED_STAGE_IDS.map((id, index) => [id, index]));

function stageIndex(stageId) {
  return STAGE_ORDER.has(stageId) ? STAGE_ORDER.get(stageId) : -1;
}

function ownerFor(stageId) {
  return STAGES.find((s) => s.id === stageId)?.owner || null;
}

/**
 * Per-component status from events attributed to that actorComponent.
 * One failing component must not be reported as total workflow failure.
 *
 * @param {object[]} active
 * @returns {Record<string, { status: string, lastResult: string|null, lastAt: string|null, blockerClass: string|null }>}
 */
export function deriveComponentStatus(active = []) {
  const status = {};
  for (const component of ACTOR_COMPONENTS) {
    status[component] = {
      status: 'unknown',
      lastResult: null,
      lastAt: null,
      blockerClass: null,
    };
  }

  for (const event of active) {
    const slot = status[event.actorComponent];
    if (!slot) continue;
    const prior = slot.lastAt ? Date.parse(slot.lastAt) : -1;
    const at = Date.parse(event.occurredAt);
    if (at < prior) continue;
    slot.lastAt = event.occurredAt;
    slot.lastResult = event.result;
    slot.blockerClass = event.blockerClass;
    if (event.result === 'fail' || event.result === 'blocked') {
      slot.status = 'degraded';
    } else if (event.result === 'unknown') {
      slot.status = slot.status === 'degraded' ? 'degraded' : 'unknown';
    } else if (event.result === 'pass' || event.result === 'deferred') {
      slot.status = slot.status === 'degraded' ? 'degraded' : 'healthy';
    }
  }

  return status;
}

/**
 * Walk active events and compute the current stage pointer.
 * Advancement requires a successful `end` (or a blocked phase that is the
 * latest evidence). Unknown/evidence-missing at the frontier is preserved.
 *
 * @param {object[]} active
 */
export function deriveStagePointer(active = []) {
  let currentStage = REQUIRED_STAGE_IDS[0];
  let currentPhase = 'unknown';
  let lastSuccessfulTransition = null;
  let frontierEvent = null;
  let evidenceQuality = 'unknown_evidence_missing';
  let blockerClass = null;
  let nextExpectedAction = null;

  const byStage = new Map();
  for (const event of active) {
    const list = byStage.get(event.stage) || [];
    list.push(event);
    byStage.set(event.stage, list);
  }

  for (const stageId of REQUIRED_STAGE_IDS) {
    const events = byStage.get(stageId) || [];
    if (events.length === 0) break;

    // The chronologically latest event is the stage's current truth.
    const latest = events[events.length - 1];
    frontierEvent = latest;
    currentStage = stageId;
    currentPhase = latest.phase;
    evidenceQuality = latest.evidenceQuality;
    blockerClass = latest.blockerClass;
    nextExpectedAction = latest.nextExpectedAction;

    // Advancement requires the LATEST event itself to be a successful end.
    // An older successful end never overrides newer blocked/fail/unknown
    // evidence for the same stage.
    const advanced =
      latest.phase === 'end' && (latest.result === 'pass' || latest.result === 'deferred');
    if (advanced) {
      lastSuccessfulTransition = {
        stage: stageId,
        occurredAt: latest.occurredAt,
        idempotencyKey: latest.idempotencyKey,
      };
      continue;
    }

    // Blocked / fail / unknown / in-progress stops advancement.
    break;
  }

  // If the latest stage ended successfully and a later stage has no events,
  // current stage is still the completed one with phase end; next action
  // points at the successor begin.
  if (
    currentPhase === 'end' &&
    (frontierEvent?.result === 'pass' || frontierEvent?.result === 'deferred')
  ) {
    const idx = stageIndex(currentStage);
    const next = REQUIRED_STAGE_IDS[idx + 1];
    if (next && !byStage.has(next)) {
      nextExpectedAction = {
        owner: ownerFor(next),
        action: `begin_${next}`,
      };
    }
  }

  return {
    currentStage,
    currentPhase,
    owner: ownerFor(currentStage),
    lastSuccessfulTransition,
    frontierEvent,
    evidenceQuality,
    blockerClass,
    nextExpectedAction,
  };
}

/**
 * Materialize one transaction's derived state.
 *
 * @param {{
 *   events?: object[],
 *   now?: string|Date,
 *   transactionId?: string|null,
 * }} params
 */
export function materializeTransaction({
  events = [],
  now = new Date().toISOString(),
  transactionId = null,
} = {}) {
  const ingested = ingestEvents([], events);
  // Isolate this transaction: history, duplicates, and supersession must not
  // leak in from other transactions ingested alongside it.
  const history = transactionId
    ? ingested.events.filter((e) => e.transactionId === transactionId)
    : ingested.events;
  const active = transactionId
    ? ingested.active.filter((e) => e.transactionId === transactionId)
    : ingested.active;
  const supersededKeys = new Set(
    history.filter((e) => e.supersedes).map((e) => e.supersedes),
  );
  const activeKeys = new Set(active.map((e) => e.idempotencyKey));

  const nowMs = typeof now === 'string' ? Date.parse(now) : now.getTime();
  const pointer = deriveStagePointer(active);
  const componentStatus = deriveComponentStatus(active);

  const startedAt = active[0]?.occurredAt || null;
  const frontierAt = pointer.frontierEvent?.occurredAt || startedAt;
  const ageMs = frontierAt ? Math.max(0, nowMs - Date.parse(frontierAt)) : null;
  const totalAgeMs = startedAt ? Math.max(0, nowMs - Date.parse(startedAt)) : null;

  const failingComponents = Object.entries(componentStatus)
    .filter(([, value]) => value.status === 'degraded')
    .map(([name]) => name);

  const workflowStatus = (() => {
    if (pointer.evidenceQuality === 'unknown_evidence_missing' || pointer.currentPhase === 'unknown') {
      return 'unknown';
    }
    if (pointer.currentPhase === 'blocked' || pointer.blockerClass) {
      return 'blocked';
    }
    if (
      pointer.currentStage === 'continuation' &&
      pointer.currentPhase === 'end' &&
      pointer.frontierEvent?.result === 'pass'
    ) {
      return 'complete';
    }
    return 'in_progress';
  })();

  return {
    schemaVersion: 'lgfc-workflow-health-materialized:v1',
    transactionId:
      transactionId || active[0]?.transactionId || null,
    sourceIssue: active[0]?.sourceIssue ?? null,
    project: active[0]?.project ?? null,
    lane: active[0]?.lane || 'development',
    pr: pointer.frontierEvent?.pr ?? active.find((e) => e.pr != null)?.pr ?? null,
    candidateSha:
      pointer.frontierEvent?.candidateSha ??
      active.find((e) => e.candidateSha)?.candidateSha ??
      null,
    currentStage: pointer.currentStage,
    currentPhase: pointer.currentPhase,
    owner: pointer.owner,
    ageMs,
    totalAgeMs,
    lastSuccessfulTransition: pointer.lastSuccessfulTransition,
    nextExpectedAction: pointer.nextExpectedAction,
    blockerClass: pointer.blockerClass,
    evidenceQuality: pointer.evidenceQuality,
    workflowStatus,
    componentStatus,
    failingComponents,
    activeEventCount: active.length,
    historicalEventCount: history.length,
    suppressedDuplicates: ingested.suppressedDuplicates,
    supersededKeys: [...supersededKeys].filter((key) => !activeKeys.has(key)),
    derivedAt: typeof now === 'string' ? now : now.toISOString(),
    // Hard guarantee for acceptance criteria.
    mutatesExecutionAuthority: false,
  };
}

/**
 * Materialize many transactions keyed by transactionId.
 * @param {{ events?: object[], now?: string|Date }} params
 */
export function materializeAllTransactions({ events = [], now = new Date().toISOString() } = {}) {
  const ingested = ingestEvents([], events);
  const ids = [...new Set(ingested.events.map((e) => e.transactionId))];
  return ids.map((transactionId) =>
    materializeTransaction({
      // Pass only this transaction's history so no cross-transaction
      // duplicate suppression, supersession, or counting can occur.
      events: ingested.events.filter((e) => e.transactionId === transactionId),
      now,
      transactionId,
    }),
  );
}
