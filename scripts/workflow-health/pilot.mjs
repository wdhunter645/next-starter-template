#!/usr/bin/env node
/**
 * Seeded-failure pilot for workflow-health reconciliation.
 * Validates that stale events, missing evidence, component-specific
 * degradation, executable-but-idle visibility, disable, and rollback
 * semantics classify correctly without fabricating healthy state or
 * deleting authoritative evidence. Work unit #2889 / parent #2680.
 *
 * Usage:
 *   node scripts/workflow-health/pilot.mjs
 */

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BRIDGE_MARKERS,
  adaptBridgeComments,
  adaptWakeWorkflowRun,
} from './adapters.mjs';
import { buildEnvelope, transactionIdFor } from './envelope.mjs';
import { reconcileDerivedState } from './reconcile.mjs';
import { pruneDetailedEvents, pruneDailyAggregates } from './retention.mjs';

export const PILOT_SCHEMA_VERSION = 'lgfc-workflow-health-pilot:v1';

const NOW = '2026-08-01T18:00:00.000Z';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** ISO timestamp `ms` before `now`, so seeds track any injected clock. */
function isoBefore(now, ms) {
  const nowMs = typeof now === 'string' ? Date.parse(now) : now.getTime();
  return new Date(nowMs - ms).toISOString();
}

function mustEnvelope(partial) {
  const built = buildEnvelope(partial);
  if (!built.ok) {
    throw new Error(`pilot_envelope_invalid:${built.errors.join(',')}`);
  }
  return built.event;
}

/**
 * Build deterministic seeded envelopes covering the #2680 pilot cases.
 */
export function buildPilotSeedEvents({ now = NOW } = {}) {
  const project = 2680;

  // Case A — executable-but-idle: authority ended, Bridge started execution,
  // no completion yet. Idle must appear in Live Flow after reconcile.
  const idleIssue = 9101;
  const idleWake = adaptWakeWorkflowRun({
    sourceIssue: idleIssue,
    project,
    workUnitId: 'pilot-idle',
    run: {
      id: 501,
      created_at: isoBefore(now, 10 * MINUTE_MS),
      actor: { login: 'actions' },
    },
  }).events;
  const idleBridge = adaptBridgeComments({
    sourceIssue: idleIssue,
    project,
    workUnitId: 'pilot-idle',
    comments: [
      {
        id: 11,
        created_at: isoBefore(now, 9.5 * MINUTE_MS),
        user: { login: 'github-actions' },
        body: `${BRIDGE_MARKERS.ACK}\nDelivery id: wake-501-9101-nolabel\n`,
      },
      {
        id: 12,
        created_at: isoBefore(now, 9 * MINUTE_MS),
        user: { login: 'bridge' },
        body: `${BRIDGE_MARKERS.STARTED}\n`,
      },
    ],
  }).events;

  // Case B — Bridge failure / component-specific degradation (bridge degraded,
  // unrelated checks component stays unknown — not total workflow failure).
  const failIssue = 9102;
  const failEvents = adaptBridgeComments({
    sourceIssue: failIssue,
    project,
    workUnitId: 'pilot-fail',
    comments: [
      {
        id: 21,
        created_at: isoBefore(now, 20 * MINUTE_MS),
        user: { login: 'bridge' },
        body: `${BRIDGE_MARKERS.FALLBACK} unclaimed — validation_failed:seeded_pilot\n`,
      },
    ],
  }).events;

  // Case C — stale transaction: old frontier, still in progress.
  const staleIssue = 9103;
  const staleEvents = [
    mustEnvelope({
      transactionId: transactionIdFor(staleIssue, 'pilot-stale'),
      sourceIssue: staleIssue,
      project,
      lane: 'development',
      stage: 'execution',
      phase: 'start',
      // Older than the pilot staleAfterMs (24h) but inside detail retention.
      occurredAt: isoBefore(now, 2 * DAY_MS),
      actor: 'cursor',
      actorComponent: 'cursor',
      result: 'pass',
      evidenceQuality: 'deterministic',
      idempotencyKey: 'pilot-stale-start',
      evidence: {
        channel: 'issue_comment',
        ref: `https://github.com/example/issues/${staleIssue}#issuecomment-1`,
        marker: 'CLAIMED — Cursor Local',
      },
    }),
  ];

  // Case D — evidence-missing unknown must never become healthy.
  const missingIssue = 9104;
  const missingEvents = [
    mustEnvelope({
      transactionId: transactionIdFor(missingIssue, 'pilot-missing'),
      sourceIssue: missingIssue,
      project,
      lane: 'development',
      stage: 'remediation',
      phase: 'unknown',
      occurredAt: isoBefore(now, HOUR_MS),
      actor: 'workflow-health-adapter',
      actorComponent: 'controller',
      result: 'unknown',
      blockerClass: 'unknown',
      evidenceQuality: 'unknown_evidence_missing',
      idempotencyKey: 'pilot-missing-gap',
      nextExpectedAction: {
        owner: 'implementation_operations',
        action: 'instrument_correction-commit-or-reply',
      },
      evidence: {
        channel: 'inventory_gap',
        ref: 'remediation/end/correction-commit-or-reply',
        marker: 'correction-commit-or-reply',
      },
    }),
  ];

  // Retention fodder — older than 30 days; must be pruned from derived store.
  const retentionFodder = [
    mustEnvelope({
      transactionId: transactionIdFor(9105, 'pilot-old'),
      sourceIssue: 9105,
      project,
      lane: 'development',
      stage: 'delivery',
      phase: 'end',
      // Beyond the 30-day detail retention window; must prune.
      occurredAt: isoBefore(now, 45 * DAY_MS),
      actor: 'actions',
      actorComponent: 'wake_workflow',
      result: 'pass',
      evidenceQuality: 'deterministic',
      idempotencyKey: 'pilot-old-delivery',
      evidence: {
        channel: 'workflow_run',
        ref: 'run/1',
        marker: 'cursor-local-wake.yml',
      },
    }),
  ];

  return {
    now,
    events: [
      ...idleWake,
      ...idleBridge,
      ...failEvents,
      ...staleEvents,
      ...missingEvents,
      ...retentionFodder,
    ],
    cases: {
      idleIssue,
      failIssue,
      staleIssue,
      missingIssue,
    },
  };
}

/**
 * Evaluate pilot assertions against a reconcile result.
 * @returns {{ ok: boolean, cases: object[], mutatesExecutionAuthority: false, deletesAuthoritativeEvidence: false }}
 */
export function evaluatePilotResult(seed, result) {
  const cases = [];
  const views = result.views;
  const byIssue = new Map(
    (views?.liveFlow?.transactions || []).map((row) => [row.sourceIssue, row]),
  );

  const idle = byIssue.get(seed.cases.idleIssue);
  cases.push({
    id: 'executable_but_idle_visible',
    ok: Boolean(idle && (idle.executableButIdleMs ?? 0) > 0 && result.idleWorkVisible),
    detail: {
      found: Boolean(idle),
      executableButIdleMs: idle?.executableButIdleMs ?? null,
      idleWorkVisible: result.idleWorkVisible,
      watcherIntervalMinutes: result.watcherIntervalMinutes,
    },
  });

  const fail = byIssue.get(seed.cases.failIssue);
  const bridgeStatus = views?.componentHealth?.components?.bridge?.status;
  const checksStatus = views?.componentHealth?.components?.checks?.status;
  cases.push({
    id: 'seeded_failure_classifies_bridge_not_total',
    ok:
      Boolean(fail) &&
      bridgeStatus === 'degraded' &&
      checksStatus === 'unknown' &&
      views?.componentHealth?.totalWorkflowFailure === false,
    detail: { bridgeStatus, checksStatus, workflowStatus: fail?.workflowStatus ?? null },
  });

  const stale = (views?.exceptions?.staleTransactions || []).some(
    (row) => row.sourceIssue === seed.cases.staleIssue,
  );
  cases.push({
    id: 'stale_transaction_listed',
    ok: stale,
    detail: { staleListed: stale },
  });

  const missing = byIssue.get(seed.cases.missingIssue);
  const missingListed = (views?.exceptions?.evidenceMissing || []).some(
    (row) => row.sourceIssue === seed.cases.missingIssue,
  );
  cases.push({
    id: 'missing_evidence_stays_unknown',
    ok:
      Boolean(missing) &&
      missing.evidenceQuality === 'unknown_evidence_missing' &&
      missing.workflowStatus === 'unknown' &&
      missingListed,
    detail: {
      evidenceQuality: missing?.evidenceQuality ?? null,
      workflowStatus: missing?.workflowStatus ?? null,
      missingListed,
    },
  });

  const oldAggregateDay = isoBefore(seed.now, 400 * DAY_MS).slice(0, 10);
  cases.push({
    id: 'retention_prunes_old_detail_only',
    ok:
      result.repairs.prunedEventCount >= 1 &&
      result.repairs.prunedAggregateCount >= 1 &&
      !result.events.some((e) => e.idempotencyKey === 'pilot-old-delivery') &&
      !result.dailyAggregates.some((row) => row.date === oldAggregateDay) &&
      result.deletesAuthoritativeEvidence === false,
    detail: {
      prunedEventCount: result.repairs.prunedEventCount,
      prunedAggregateCount: result.repairs.prunedAggregateCount,
      oldAggregateDay,
      deletesAuthoritativeEvidence: result.deletesAuthoritativeEvidence,
    },
  });

  cases.push({
    id: 'no_execution_authority',
    ok: result.mutatesExecutionAuthority === false,
    detail: { mutatesExecutionAuthority: result.mutatesExecutionAuthority },
  });

  return {
    schemaVersion: PILOT_SCHEMA_VERSION,
    ok: cases.every((c) => c.ok),
    cases,
    mutatesExecutionAuthority: false,
    deletesAuthoritativeEvidence: false,
  };
}

/**
 * Run disable + rollback preservation checks (no GitHub mutation).
 */
export function evaluateDisableAndRollback({ now = NOW } = {}) {
  const seed = buildPilotSeedEvents({ now });
  const disabled = reconcileDerivedState({
    existingEvents: seed.events,
    incomingEvents: [],
    now,
    config: { enabled: false },
  });

  // Exactly one seeded detail event (45-day fodder) and one aggregate row
  // (400-day) sit beyond their retention windows; the rest must be kept.
  const detailPrune = pruneDetailedEvents(seed.events, now, 30);
  const aggregatePrune = pruneDailyAggregates(
    [
      { date: isoBefore(now, 400 * DAY_MS).slice(0, 10), transitions: 1 },
      { date: isoBefore(now, 31 * DAY_MS).slice(0, 10), transitions: 2 },
    ],
    now,
    13,
  );

  const cases = [
    {
      id: 'disable_skips_generation',
      ok: disabled.disabled === true && disabled.views === null && disabled.ok === true,
      detail: { disabled: disabled.disabled, views: disabled.views },
    },
    {
      id: 'disable_preserves_source_events',
      ok:
        disabled.events.length === seed.events.length &&
        disabled.deletesAuthoritativeEvidence === false &&
        disabled.mutatesExecutionAuthority === false,
      detail: {
        retained: disabled.events.length,
        deletesAuthoritativeEvidence: disabled.deletesAuthoritativeEvidence,
      },
    },
    {
      id: 'rollback_prune_is_derived_only',
      ok:
        detailPrune.prunedCount === 1 &&
        aggregatePrune.prunedCount === 1 &&
        detailPrune.deletesAuthoritativeEvidence === false &&
        aggregatePrune.deletesAuthoritativeEvidence === false,
      detail: {
        prunedEvents: detailPrune.prunedCount,
        prunedAggregates: aggregatePrune.prunedCount,
        expectedPrunedEvents: 1,
        expectedPrunedAggregates: 1,
      },
    },
  ];

  return {
    schemaVersion: PILOT_SCHEMA_VERSION,
    ok: cases.every((c) => c.ok),
    cases,
    mutatesExecutionAuthority: false,
    deletesAuthoritativeEvidence: false,
  };
}

/**
 * Full pilot entry point used by tests and CI.
 */
export function runPilot({ now = NOW } = {}) {
  const seed = buildPilotSeedEvents({ now });
  // Classification must ignore a host-level WORKFLOW_HEALTH_DISABLED flip;
  // disable/rollback is exercised separately in evaluateDisableAndRollback.
  const reconciled = reconcileDerivedState({
    existingEvents: [],
    incomingEvents: seed.events,
    dailyAggregates: [{ date: isoBefore(now, 400 * DAY_MS).slice(0, 10), transitions: 9 }],
    now,
    config: {
      enabled: true,
      emitGaps: true,
      staleAfterMs: 24 * 60 * 60 * 1000,
    },
  });
  const classification = evaluatePilotResult(seed, reconciled);
  const disableRollback = evaluateDisableAndRollback({ now });

  return {
    schemaVersion: PILOT_SCHEMA_VERSION,
    ok: classification.ok && disableRollback.ok && reconciled.ok,
    classification,
    disableRollback,
    repairs: reconciled.repairs,
    mutatesExecutionAuthority: false,
    deletesAuthoritativeEvidence: false,
    paidServiceIntroduced: false,
  };
}

function main() {
  const result = runPilot();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main();
}
