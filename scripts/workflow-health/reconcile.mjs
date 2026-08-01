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
 * Collect unique (sourceIssue, project, workUnitId, lane) keys from envelopes
 * so gap emission can be scoped per transaction without inventing issues.
 */
export function transactionScopesFromEvents(events = []) {
  const scopes = new Map();
  for (const event of events) {
    if (event?.sourceIssue == null) continue;
    const workUnitId = (() => {
      const match = String(event.transactionId || '').match(/::wu-(.+)$/);
      return match ? match[1] : null;
    })();
    const key = `${event.sourceIssue}\u0000${workUnitId ?? ''}\u0000${event.lane || 'development'}`;
    if (!scopes.has(key)) {
      scopes.set(key, {
        sourceIssue: event.sourceIssue,
        project: event.project ?? null,
        workUnitId,
        lane: event.lane || 'development',
      });
    }
  }
  return [...scopes.values()];
}

/**
 * Emit inventory-gap unknown events for every known transaction scope.
 * Never emits a healthy pass for an uninstrumented boundary.
 */
export function emitReconciliationGaps({ events = [], now = new Date().toISOString() } = {}) {
  const gapEvents = [];
  const errors = [];
  for (const scope of transactionScopesFromEvents(events)) {
    const part = adaptEvidenceMissingGaps({
      ...scope,
      occurredAt: now,
    });
    gapEvents.push(...part.events);
    errors.push(...part.errors);
  }
  return { events: gapEvents, errors };
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
  now = new Date().toISOString(),
  config = {},
  writeViews = false,
  outDir = DEFAULT_OUT_DIR,
} = {}) {
  const resolved = resolveReconcileConfig(config);
  const nowIso = typeof now === 'string' ? now : now.toISOString();

  if (!resolved.enabled) {
    return {
      schemaVersion: RECONCILE_SCHEMA_VERSION,
      ok: true,
      disabled: true,
      reason: 'workflow_health_disabled',
      events: existingEvents,
      active: [],
      dailyAggregates,
      views: null,
      repairs: {
        duplicatesSuppressed: 0,
        gapsEmitted: 0,
        prunedEventCount: 0,
        prunedAggregateCount: 0,
        rejectedCount: 0,
      },
      idleWorkVisible: false,
      watcherIntervalMinutes: resolved.watcherIntervalMinutes,
      mutatesExecutionAuthority: false,
      deletesAuthoritativeEvidence: false,
      reconciledAt: nowIso,
    };
  }

  let workingIncoming = [...incomingEvents];
  let gapsEmitted = 0;
  if (resolved.emitGaps) {
    const gapPass = emitReconciliationGaps({
      events: [...existingEvents, ...incomingEvents],
      now: nowIso,
    });
    workingIncoming = [...workingIncoming, ...gapPass.events];
    gapsEmitted = gapPass.events.length;
  }

  const ingested = ingestEvents(existingEvents, workingIncoming);

  const prunedEvents = pruneDetailedEvents(
    ingested.events,
    nowIso,
    resolved.detailRetentionDays,
  );
  // Re-ingest after prune so active/supersession reflect the retained set.
  const retained = ingestEvents([], prunedEvents.events);

  const views = buildHealthViews({
    events: retained.events,
    now: nowIso,
    sloConfig: { watcherIntervalMinutes: resolved.watcherIntervalMinutes },
    staleAfterMs: resolved.staleAfterMs,
  });

  const mergedAggregates = upsertDailyAggregates(dailyAggregates, views.dailyPerformance);
  const prunedAggregates = pruneDailyAggregates(
    mergedAggregates,
    nowIso,
    resolved.aggregateRetentionMonths,
  );

  // Idle work must appear in Live Flow when executable-but-idle is derived.
  // Schedule cadence is expected to be ≤ watcherIntervalMinutes so visibility
  // stays inside one watcher interval of the idle condition arising.
  const idleRows = (views.liveFlow?.transactions || []).filter(
    (row) => (row.executableButIdleMs ?? 0) > 0,
  );
  const idleWorkVisible = idleRows.length > 0;

  let written = null;
  if (writeViews) {
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
    ok: retained.rejected.length === 0 && ingested.rejected.length === 0,
    disabled: false,
    events: retained.events,
    active: retained.active,
    dailyAggregates: prunedAggregates.aggregates,
    views,
    written,
    repairs: {
      duplicatesSuppressed: ingested.suppressedDuplicates.length,
      gapsEmitted,
      prunedEventCount: prunedEvents.prunedCount,
      prunedAggregateCount: prunedAggregates.prunedCount,
      rejectedCount: retained.rejected.length + ingested.rejected.length,
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

  const store = loadJson(storePath, { events: [], dailyAggregates: [] });
  const incoming = eventsPath ? loadJson(eventsPath, []) : [];
  if (!Array.isArray(incoming)) {
    throw new Error(`events_file_not_an_array:${eventsPath}`);
  }

  const result = reconcileDerivedState({
    existingEvents: Array.isArray(store.events) ? store.events : [],
    incomingEvents: incoming,
    dailyAggregates: Array.isArray(store.dailyAggregates) ? store.dailyAggregates : [],
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
