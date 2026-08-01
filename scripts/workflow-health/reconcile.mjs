#!/usr/bin/env node
/**
 * Scheduled derived-state reconciliation for workflow-health observability.
 * Repairs materialized views from authoritative envelopes, forces gap
 * visibility when configured, applies retention, and never fabricates a
 * healthy state for missing evidence. Read-only w.r.t. GitHub execution
 * authority. Work unit #2889 (2680-004) / parent #2680.
 *
 * Usage:
 *   node scripts/workflow-health/reconcile.mjs [events.json]
 *
 * Environment:
 *   WORKFLOW_HEALTH_EVENTS_FILE   input envelope JSON array
 *   WORKFLOW_HEALTH_STORE_FILE    prior store JSON ({ events, dailyAggregates })
 *   WORKFLOW_HEALTH_OUT_DIR       views output directory (default site/workflow-health)
 *   WORKFLOW_HEALTH_DISABLED      1|true|yes disables generation without deleting evidence
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adaptEvidenceMissingGaps } from './adapters.mjs';
import { resolveReconcileConfig } from './config.mjs';
import { validateEnvelope } from './envelope.mjs';
import { REQUIRED_STAGE_IDS } from './event-inventory.mjs';
import { ingestEvents } from './ingest.mjs';
import {
  pruneDailyAggregates,
  pruneDetailedEvents,
  upsertDailyAggregates,
} from './retention.mjs';
import { buildHealthViews } from './views.mjs';

export const RECONCILE_SCHEMA_VERSION = 'lgfc-workflow-health-reconcile:v1';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT_DIR = 'site/workflow-health';

function loadJson(path, fallback) {
  if (!path || !existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Collect unique transaction scopes from envelopes (and optional durable
 * summaries). Preserves the original `transactionId` and the latest non-gap
 * evidence timestamp used for stale-age overlay after gap emission.
 */
export function transactionScopesFromEvents(events = [], summaries = []) {
  const scopes = new Map();
  for (const summary of summaries || []) {
    if (!summary?.transactionId || summary?.sourceIssue == null) continue;
    scopes.set(summary.transactionId, {
      transactionId: summary.transactionId,
      sourceIssue: summary.sourceIssue,
      project: summary.project ?? null,
      lane: summary.lane || 'development',
      lastRealAt: summary.lastRealAt || null,
      enteredStages: new Set(summary.enteredStages || []),
      complete: summary.complete === true,
    });
  }
  for (const event of events) {
    if (event?.sourceIssue == null || !event?.transactionId) continue;
    if (!scopes.has(event.transactionId)) {
      scopes.set(event.transactionId, {
        transactionId: event.transactionId,
        sourceIssue: event.sourceIssue,
        project: event.project ?? null,
        lane: event.lane || 'development',
        lastRealAt: null,
        enteredStages: new Set(),
        complete: false,
      });
    }
    const scope = scopes.get(event.transactionId);
    if (event.evidence?.channel === 'inventory_gap') continue;
    scope.enteredStages.add(event.stage);
    if (
      event.stage === 'continuation' &&
      event.phase === 'end' &&
      (event.result === 'pass' || event.result === 'deferred')
    ) {
      scope.complete = true;
    }
    const at = Date.parse(event.occurredAt);
    if (!Number.isFinite(at)) continue;
    const prior = scope.lastRealAt ? Date.parse(scope.lastRealAt) : -1;
    if (at >= prior) scope.lastRealAt = event.occurredAt;
  }
  return [...scopes.values()];
}

/**
 * Stages for which inventory gaps may be emitted for a transaction.
 * Remediation is optional ("if required") — only gap it after entry.
 * Other gaps are limited to entered stages plus the immediate successor of
 * the latest entered stage so completed happy paths are not forced unknown.
 */
export function gapEligibleStagesForScope(scope) {
  const entered = scope.enteredStages instanceof Set
    ? scope.enteredStages
    : new Set(scope.enteredStages || []);
  if (scope.complete) return new Set();
  const eligible = new Set(entered);
  let latestIdx = -1;
  for (const stage of entered) {
    latestIdx = Math.max(latestIdx, REQUIRED_STAGE_IDS.indexOf(stage));
  }
  if (latestIdx >= 0) {
    const next = REQUIRED_STAGE_IDS[latestIdx + 1];
    if (next && next !== 'remediation') eligible.add(next);
    // Remediation is eligible only when already entered.
  }
  return eligible;
}

/**
 * Emit inventory-gap unknown events for known transaction scopes.
 * Gap envelopes are stamped at `now` so they survive detail retention;
 * stale age is overlaid afterward from `lastRealAt`.
 */
export function emitReconciliationGaps({
  events = [],
  summaries = [],
  now = new Date().toISOString(),
} = {}) {
  const gapEvents = [];
  const errors = [];
  for (const scope of transactionScopesFromEvents(events, summaries)) {
    if (scope.complete) continue;
    const eligible = gapEligibleStagesForScope(scope);
    if (eligible.size === 0) continue;
    const part = adaptEvidenceMissingGaps({
      sourceIssue: scope.sourceIssue,
      project: scope.project,
      transactionId: scope.transactionId,
      lane: scope.lane,
      // Stamp at reconciliation time so forced visibility survives the
      // 30-day detail prune; evidence age is restored via overlay.
      occurredAt: now,
    });
    for (const event of part.events) {
      if (!eligible.has(event.stage)) continue;
      gapEvents.push(event);
    }
    errors.push(...part.errors);
  }
  return { events: gapEvents, errors };
}

/**
 * Overlay evidence age from durable lastRealAt onto Live Flow / Exceptions
 * so synthetic gaps stamped at `now` cannot hide genuine staleness.
 */
export function applyEvidenceAgeOverlay(views, scopes = [], {
  nowMs = Date.now(),
  staleAfterMs = 24 * 60 * 60 * 1000,
} = {}) {
  if (!views?.liveFlow) return views;
  const byId = new Map(scopes.map((s) => [s.transactionId, s]));
  for (const row of views.liveFlow.transactions || []) {
    const scope = byId.get(row.transactionId);
    if (!scope?.lastRealAt) continue;
    const evidenceAgeMs = Math.max(0, nowMs - Date.parse(scope.lastRealAt));
    row.ageMs = evidenceAgeMs;
    row.evidenceAgeMs = evidenceAgeMs;
  }

  const stale = [];
  const seen = new Set();
  for (const row of views.exceptions?.staleTransactions || []) {
    stale.push(row);
    seen.add(row.transactionId);
  }
  for (const scope of scopes) {
    if (!scope.lastRealAt || scope.complete || seen.has(scope.transactionId)) continue;
    const ageMs = Math.max(0, nowMs - Date.parse(scope.lastRealAt));
    if (ageMs <= staleAfterMs) continue;
    const live = (views.liveFlow.transactions || []).find(
      (r) => r.transactionId === scope.transactionId,
    );
    if (live?.workflowStatus === 'complete') continue;
    stale.push({
      transactionId: scope.transactionId,
      sourceIssue: scope.sourceIssue,
      pr: live?.pr ?? null,
      currentStage: live?.currentStage ?? null,
      owner: live?.owner ?? null,
      ageMs,
      staleAfterMs,
    });
  }
  if (views.exceptions) {
    views.exceptions.staleTransactions = stale;
    views.exceptions.exceptionCount =
      (views.exceptions.sloBreaches?.length || 0) +
      (views.exceptions.protectedStops?.length || 0) +
      (views.exceptions.evidenceMissing?.length || 0) +
      stale.length;
  }
  return views;
}

/** Durable per-transaction summary retained across detail pruning. */
export function buildTransactionSummaries(scopes = []) {
  return scopes.map((scope) => ({
    transactionId: scope.transactionId,
    sourceIssue: scope.sourceIssue,
    project: scope.project,
    lane: scope.lane,
    lastRealAt: scope.lastRealAt,
    enteredStages: [...(scope.enteredStages || [])],
    complete: scope.complete === true,
  }));
}

/**
 * Validate a prior derived store. Corrupt envelopes fail the pass; they are
 * never silently dropped and overwritten as a successful empty store.
 */
export function validateStoreEvents(events = []) {
  const valid = [];
  const rejected = [];
  for (const event of events) {
    const validation = validateEnvelope(event);
    if (validation.ok) valid.push(event);
    else {
      rejected.push({
        idempotencyKey: event?.idempotencyKey ?? null,
        errors: validation.errors,
        source: 'store',
      });
    }
  }
  return { valid, rejected };
}

/**
 * Run one reconciliation pass against an existing store + incoming envelopes.
 *
 * @param {{
 *   existingEvents?: object[],
 *   incomingEvents?: object[],
 *   dailyAggregates?: object[],
 *   now?: string|Date,
 *   config?: object,
 *   writeViews?: boolean,
 *   outDir?: string,
 * }} params
 */
export function reconcileDerivedState({
  existingEvents = [],
  incomingEvents = [],
  dailyAggregates = [],
  transactionSummaries = [],
  now = new Date().toISOString(),
  config = {},
  writeViews = false,
  outDir = DEFAULT_OUT_DIR,
} = {}) {
  const resolved = resolveReconcileConfig(config);
  const nowIso = typeof now === 'string' ? now : now.toISOString();
  const nowMs = Date.parse(nowIso);

  if (!resolved.enabled) {
    return {
      schemaVersion: RECONCILE_SCHEMA_VERSION,
      ok: true,
      disabled: true,
      reason: 'workflow_health_disabled',
      events: existingEvents,
      active: [],
      dailyAggregates,
      transactionSummaries,
      views: null,
      repairs: {
        duplicatesSuppressed: 0,
        gapsEmitted: 0,
        prunedEventCount: 0,
        prunedAggregateCount: 0,
        rejectedCount: 0,
        storeRejectedCount: 0,
      },
      idleWorkVisible: false,
      watcherIntervalMinutes: resolved.watcherIntervalMinutes,
      mutatesExecutionAuthority: false,
      deletesAuthoritativeEvidence: false,
      reconciledAt: nowIso,
    };
  }

  const storeValidation = validateStoreEvents(existingEvents);
  if (storeValidation.rejected.length > 0) {
    // Fail closed: do not overwrite a corrupt store with a "successful" empty
    // or partial replacement. Operators must repair the store intentionally.
    return {
      schemaVersion: RECONCILE_SCHEMA_VERSION,
      ok: false,
      disabled: false,
      reason: 'corrupt_prior_store',
      events: existingEvents,
      active: [],
      dailyAggregates,
      transactionSummaries,
      views: null,
      written: null,
      repairs: {
        duplicatesSuppressed: 0,
        gapsEmitted: 0,
        prunedEventCount: 0,
        prunedAggregateCount: 0,
        rejectedCount: storeValidation.rejected.length,
        storeRejectedCount: storeValidation.rejected.length,
      },
      storeRejected: storeValidation.rejected,
      idleWorkVisible: false,
      watcherIntervalMinutes: resolved.watcherIntervalMinutes,
      mutatesExecutionAuthority: false,
      deletesAuthoritativeEvidence: false,
      reconciledAt: nowIso,
    };
  }

  const preScopes = transactionScopesFromEvents(
    [...storeValidation.valid, ...incomingEvents],
    transactionSummaries,
  );

  let workingIncoming = [...incomingEvents];
  let gapsEmitted = 0;
  if (resolved.emitGaps) {
    const gapPass = emitReconciliationGaps({
      events: [...storeValidation.valid, ...incomingEvents],
      summaries: transactionSummaries,
      now: nowIso,
    });
    workingIncoming = [...workingIncoming, ...gapPass.events];
    gapsEmitted = gapPass.events.length;
  }

  const ingested = ingestEvents(storeValidation.valid, workingIncoming);

  const prunedEvents = pruneDetailedEvents(
    ingested.events,
    nowIso,
    resolved.detailRetentionDays,
  );
  // Re-ingest after prune so active/supersession reflect the retained set.
  const retained = ingestEvents([], prunedEvents.events);

  // Durable summaries survive detail pruning so forced gap/stale visibility
  // remains even when the only real evidence falls outside the 30-day window.
  const summaries = buildTransactionSummaries(preScopes);

  let views = buildHealthViews({
    events: retained.events,
    now: nowIso,
    sloConfig: { watcherIntervalMinutes: resolved.watcherIntervalMinutes },
    staleAfterMs: resolved.staleAfterMs,
  });
  views = applyEvidenceAgeOverlay(views, preScopes, {
    nowMs,
    staleAfterMs: resolved.staleAfterMs,
  });

  const mergedAggregates = upsertDailyAggregates(dailyAggregates, views.dailyPerformance);
  const prunedAggregates = pruneDailyAggregates(
    mergedAggregates,
    nowIso,
    resolved.aggregateRetentionMonths,
  );
  // Feed the 13-month aggregate store back into the published Daily Performance
  // view so history older than detail retention remains operator-visible.
  views.dailyPerformance = {
    ...views.dailyPerformance,
    days: prunedAggregates.aggregates.map((row) => ({
      date: row.date,
      transitions: row.transitions ?? 0,
      completedTransactions: row.completedTransactions ?? 0,
      medianTransitionMs: row.medianTransitionMs ?? null,
      maxTransitionMs: row.maxTransitionMs ?? null,
      executableButIdleMs: row.executableButIdleMs,
    })),
  };

  // Idle work must appear in Live Flow when executable-but-idle is derived.
  // Five-minute watcher visibility is provided by the local wake/check-in
  // reconciler hook; the Actions artifact refresh stays on a coarser cadence.
  const idleRows = (views.liveFlow?.transactions || []).filter(
    (row) => (row.executableButIdleMs ?? 0) > 0,
  );
  const idleWorkVisible = idleRows.length > 0;

  const passOk = retained.rejected.length === 0 && ingested.rejected.length === 0;

  let written = null;
  // Persist only on a successful pass so a failed/corrupt run cannot replace
  // a prior good store or publish a partial view as healthy.
  if (writeViews && passOk) {
    const resolvedOut = resolve(outDir);
    mkdirSync(resolvedOut, { recursive: true });
    const dataPath = join(resolvedOut, 'health-data.json');
    const storePath = join(resolvedOut, 'reconcile-store.json');
    const payload = {
      ...views,
      reconciliation: {
        schemaVersion: RECONCILE_SCHEMA_VERSION,
        reconciledAt: nowIso,
        disabled: false,
        watcherIntervalMinutes: resolved.watcherIntervalMinutes,
      },
    };
    writeFileSync(dataPath, `${JSON.stringify(payload, null, 2)}\n`);
    writeFileSync(
      storePath,
      `${JSON.stringify(
        {
          schemaVersion: RECONCILE_SCHEMA_VERSION,
          reconciledAt: nowIso,
          events: retained.events,
          dailyAggregates: prunedAggregates.aggregates,
          transactionSummaries: summaries,
          deletesAuthoritativeEvidence: false,
          mutatesExecutionAuthority: false,
        },
        null,
        2,
      )}\n`,
    );
    const staticIndex = join(SCRIPT_DIR, 'static', 'index.html');
    if (existsSync(staticIndex)) {
      copyFileSync(staticIndex, join(resolvedOut, 'index.html'));
    }
    written = { outDir: resolvedOut, dataPath, storePath, views: payload };
  }

  return {
    schemaVersion: RECONCILE_SCHEMA_VERSION,
    // Malformed incoming envelopes must fail the pass, not silently drop:
    // first-pass ingest rejections count against ok alongside re-ingest.
    ok: passOk,
    disabled: false,
    events: retained.events,
    active: retained.active,
    dailyAggregates: prunedAggregates.aggregates,
    transactionSummaries: summaries,
    views,
    written,
    repairs: {
      duplicatesSuppressed: ingested.suppressedDuplicates.length,
      gapsEmitted,
      prunedEventCount: prunedEvents.prunedCount,
      prunedAggregateCount: prunedAggregates.prunedCount,
      rejectedCount: retained.rejected.length + ingested.rejected.length,
      storeRejectedCount: 0,
    },
    idleWorkVisible,
    watcherIntervalMinutes: resolved.watcherIntervalMinutes,
    mutatesExecutionAuthority: false,
    deletesAuthoritativeEvidence: false,
    reconciledAt: nowIso,
  };
}

function main(argv) {
  const eventsPath = argv[2] || process.env.WORKFLOW_HEALTH_EVENTS_FILE || null;
  const storePath = process.env.WORKFLOW_HEALTH_STORE_FILE || null;
  const outDir = process.env.WORKFLOW_HEALTH_OUT_DIR || DEFAULT_OUT_DIR;

  const store = loadJson(storePath, {
    events: [],
    dailyAggregates: [],
    transactionSummaries: [],
  });
  const incoming = eventsPath ? loadJson(eventsPath, []) : [];
  if (!Array.isArray(incoming)) {
    throw new Error(`events_file_not_an_array:${eventsPath}`);
  }

  const result = reconcileDerivedState({
    existingEvents: Array.isArray(store.events) ? store.events : [],
    incomingEvents: incoming,
    dailyAggregates: Array.isArray(store.dailyAggregates) ? store.dailyAggregates : [],
    transactionSummaries: Array.isArray(store.transactionSummaries)
      ? store.transactionSummaries
      : [],
    writeViews: true,
    outDir,
  });

  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        disabled: result.disabled,
        eventCount: result.events.length,
        dailyAggregateCount: result.dailyAggregates.length,
        repairs: result.repairs,
        idleWorkVisible: result.idleWorkVisible,
        watcherIntervalMinutes: result.watcherIntervalMinutes,
        outDir: result.written?.outDir || null,
        mutatesExecutionAuthority: result.mutatesExecutionAuthority,
        deletesAuthoritativeEvidence: result.deletesAuthoritativeEvidence,
      },
      null,
      2,
    ),
  );

  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main(process.argv);
}
