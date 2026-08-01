#!/usr/bin/env node
/**
 * Informational SLO engine for workflow-health observability.
 * First-release SLOs are informational only: one configured watcher interval
 * for pickup visibility, plus optional per-stage thresholds. Changing
 * enforcement requires separate Product Authority. Derived metrics never
 * mutate execution authority. Work unit #2887 / parent #2680.
 */

import { REQUIRED_STAGE_IDS } from './event-inventory.mjs';
import { materializeTransaction } from './materializer.mjs';

/** Default first-release informational SLO configuration. */
export const DEFAULT_SLO_CONFIG = Object.freeze({
  /** Watcher / poll interval used for pickup-visibility SLO (minutes). */
  watcherIntervalMinutes: 5,
  /**
   * Optional per-stage age thresholds in minutes. Null = not configured.
   * Informational only — breaches are reported, never enforced.
   */
  stageThresholdMinutes: Object.freeze({
    authority_ready: 30,
    delivery: 15,
    eligibility: 15,
    execution: 240,
    review: 1440,
    remediation: 240,
    integration: 60,
    verification: 60,
    closeout: 240,
    continuation: 60,
  }),
  /** Stages that count as "executable" for idle-time accounting. */
  executableStages: Object.freeze(['authority_ready', 'eligibility', 'execution', 'remediation']),
});

/**
 * @param {Partial<typeof DEFAULT_SLO_CONFIG>} [overrides]
 */
export function resolveSloConfig(overrides = {}) {
  return {
    watcherIntervalMinutes:
      overrides.watcherIntervalMinutes ?? DEFAULT_SLO_CONFIG.watcherIntervalMinutes,
    stageThresholdMinutes: {
      ...DEFAULT_SLO_CONFIG.stageThresholdMinutes,
      ...(overrides.stageThresholdMinutes || {}),
    },
    executableStages: overrides.executableStages
      ? [...overrides.executableStages]
      : [...DEFAULT_SLO_CONFIG.executableStages],
  };
}

function minutesToMs(minutes) {
  return Number(minutes) * 60 * 1000;
}

/**
 * Compute executable-but-idle duration: time spent in an executable stage
 * with no advancing end/pass event after authority was ready.
 *
 * @param {object[]} activeEvents
 * @param {object} materialized
 * @param {number} nowMs
 * @param {string[]} executableStages
 */
export function computeExecutableButIdleMs(
  activeEvents,
  materialized,
  nowMs,
  executableStages = DEFAULT_SLO_CONFIG.executableStages,
) {
  if (!materialized || materialized.workflowStatus === 'complete') return 0;
  if (!executableStages.includes(materialized.currentStage)) return 0;

  // Idle only when we are waiting on an owner action with pass/start evidence
  // already present (work is executable) and no end has occurred.
  if (materialized.currentPhase === 'end') return 0;
  if (materialized.currentPhase === 'blocked') return 0;
  if (materialized.evidenceQuality === 'unknown_evidence_missing') return 0;

  const frontierAt = materialized.ageMs == null
    ? null
    : nowMs - materialized.ageMs;
  if (frontierAt == null) return 0;

  // Require at least one pass/start event proving the work is executable.
  const executableEvidence = activeEvents.some(
    (e) =>
      executableStages.includes(e.stage) &&
      (e.result === 'pass' || e.phase === 'start') &&
      e.evidenceQuality === 'deterministic',
  );
  if (!executableEvidence) return 0;

  return Math.max(0, nowMs - frontierAt);
}

/**
 * Evaluate informational SLOs for one materialized transaction.
 *
 * @param {{
 *   events?: object[],
 *   state?: object|null,
 *   now?: string|Date,
 *   config?: object,
 * }} params
 */
export function evaluateSlo({
  events = [],
  state = null,
  now = new Date().toISOString(),
  config = {},
} = {}) {
  const resolved = resolveSloConfig(config);
  const nowIso = typeof now === 'string' ? now : now.toISOString();
  const nowMs = Date.parse(nowIso);
  const materialized =
    state || materializeTransaction({ events, now: nowIso });

  const active = events.filter(
    (e) =>
      !state ||
      !state.supersededKeys?.includes(e.idempotencyKey),
  );

  const breaches = [];

  // Pickup visibility: once authority_ready has ended (wake started), an
  // execution start (or eligibility fallback / manual pickup via PR) should
  // appear within one watcher interval.
  const authorityEnd = active.find(
    (e) => e.stage === 'authority_ready' && e.phase === 'end' && e.result === 'pass',
  );
  const pickupEvidence = active.find(
    (e) =>
      (e.stage === 'execution' && e.phase === 'start') ||
      (e.stage === 'eligibility' && e.phase === 'end') ||
      (e.stage === 'execution' && e.phase === 'end' && e.actorComponent === 'cursor'),
  );

  let pickupVisibleWithinInterval = null;
  if (authorityEnd) {
    const deadlineMs =
      Date.parse(authorityEnd.occurredAt) + minutesToMs(resolved.watcherIntervalMinutes);
    const deadlineIso = new Date(deadlineMs).toISOString();
    if (pickupEvidence) {
      pickupVisibleWithinInterval = Date.parse(pickupEvidence.occurredAt) <= deadlineMs;
      if (!pickupVisibleWithinInterval) {
        breaches.push({
          kind: 'pickup_visibility',
          stage: 'execution',
          breachedAt: pickupEvidence.occurredAt,
          deadline: deadlineIso,
          sourceIssue: materialized.sourceIssue,
          pr: materialized.pr,
          evidenceRef: pickupEvidence.evidence?.ref || null,
          informational: true,
        });
      }
    } else if (nowMs > deadlineMs) {
      pickupVisibleWithinInterval = false;
      breaches.push({
        kind: 'pickup_visibility',
        stage: 'execution',
        breachedAt: nowIso,
        deadline: deadlineIso,
        sourceIssue: materialized.sourceIssue,
        pr: materialized.pr,
        evidenceRef: authorityEnd.evidence?.ref || null,
        informational: true,
      });
    } else {
      pickupVisibleWithinInterval = true;
    }
  }

  // Per-stage age thresholds (informational).
  if (
    materialized.ageMs != null &&
    REQUIRED_STAGE_IDS.includes(materialized.currentStage) &&
    materialized.currentPhase !== 'end'
  ) {
    const thresholdMin = resolved.stageThresholdMinutes[materialized.currentStage];
    if (thresholdMin != null && materialized.ageMs > minutesToMs(thresholdMin)) {
      breaches.push({
        kind: 'stage_age',
        stage: materialized.currentStage,
        breachedAt: nowIso,
        deadline: new Date(
          (materialized.ageMs != null ? nowMs - materialized.ageMs : nowMs) +
            minutesToMs(thresholdMin),
        ).toISOString(),
        ageMs: materialized.ageMs,
        thresholdMinutes: thresholdMin,
        sourceIssue: materialized.sourceIssue,
        pr: materialized.pr,
        evidenceRef: null,
        informational: true,
      });
    }
  }

  const executableButIdleMs = computeExecutableButIdleMs(
    active,
    materialized,
    nowMs,
    resolved.executableStages,
  );

  return {
    schemaVersion: 'lgfc-workflow-health-slo:v1',
    transactionId: materialized.transactionId,
    sourceIssue: materialized.sourceIssue,
    pr: materialized.pr,
    evaluatedAt: nowIso,
    config: {
      watcherIntervalMinutes: resolved.watcherIntervalMinutes,
      informationalOnly: true,
    },
    pickupVisibleWithinInterval,
    executableButIdleMs,
    sloBreach: breaches.length > 0,
    breaches,
    // Hard guarantee for acceptance criteria.
    mutatesExecutionAuthority: false,
    enforcement: 'informational',
  };
}
