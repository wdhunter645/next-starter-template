#!/usr/bin/env node
/**
 * Zero-cost health data products for workflow observability: Live Flow,
 * Exceptions, Daily Performance, Two-Week Trend, and Component Health.
 * All five views derive from the same ingested envelope event model via the
 * #2887 materializer and SLO engine. Pure derivation — read-only, no GitHub
 * I/O, no authority. Work unit #2888 (2680-003) / parent #2680.
 */

import { ACTOR_COMPONENTS, REQUIRED_STAGE_IDS } from './event-inventory.mjs';
import { ingestEvents } from './ingest.mjs';
import { materializeAllTransactions } from './materializer.mjs';
import { evaluateSlo } from './slo.mjs';

export const VIEWS_SCHEMA_VERSION = 'lgfc-workflow-health-views:v1';

export const TREND_WINDOW_DAYS = 14;

/**
 * Redact secret-shaped substrings and email addresses from any string that
 * reaches a published view, and bound its length. Views only copy
 * contract-whitelisted fields, so this is defense in depth for free-text
 * fields (actions, markers, refs).
 */
const REDACTION_PATTERNS = [
  /\bgh[pousr]_[A-Za-z0-9]{16,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{16,}\b/g,
  /\b[Bb]earer\s+[A-Za-z0-9._~+/=-]{8,}\b/g,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
];

const MAX_STRING_LENGTH = 500;

export function redactSensitive(value) {
  if (typeof value !== 'string') return value;
  let out = value;
  for (const pattern of REDACTION_PATTERNS) out = out.replace(pattern, '[redacted]');
  if (out.length > MAX_STRING_LENGTH) out = `${out.slice(0, MAX_STRING_LENGTH)}…`;
  return out;
}

/** Deep-apply redaction to every string in a JSON-safe structure. */
export function redactDeep(value) {
  if (typeof value === 'string') return redactSensitive(value);
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, child] of Object.entries(value)) out[key] = redactDeep(child);
    return out;
  }
  return value;
}

function utcDayOf(iso) {
  return typeof iso === 'string' && iso.length >= 10 ? iso.slice(0, 10) : null;
}

function percentile(sortedValues, fraction) {
  if (sortedValues.length === 0) return null;
  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.ceil(fraction * sortedValues.length) - 1),
  );
  return sortedValues[index];
}

function evidenceRefOf(event) {
  return event?.evidence?.ref ?? null;
}

/**
 * Pair start→end events per transaction+stage to compute transition
 * durations. An end pairs with the latest earlier start for the same
 * transaction and stage; unpaired ends contribute no duration.
 */
export function computeTransitionDurations(active = []) {
  const durations = [];
  const openStarts = new Map();
  for (const event of active) {
    const key = `${event.transactionId}\u0000${event.stage}`;
    if (event.phase === 'start') {
      openStarts.set(key, event);
    } else if (event.phase === 'end') {
      const start = openStarts.get(key);
      if (start) {
        const ms = Date.parse(event.occurredAt) - Date.parse(start.occurredAt);
        if (Number.isFinite(ms) && ms >= 0) {
          durations.push({
            transactionId: event.transactionId,
            sourceIssue: event.sourceIssue,
            stage: event.stage,
            startedAt: start.occurredAt,
            endedAt: event.occurredAt,
            durationMs: ms,
            result: event.result,
            evidenceRef: evidenceRefOf(event),
          });
        }
        openStarts.delete(key);
      }
    }
  }
  return durations;
}

/**
 * Live Flow: current transaction, stage, owner, age, and next action.
 * Unknown-evidence transactions are flagged and kept visible, never dropped.
 */
export function buildLiveFlowView({ materialized = [], slos = new Map() } = {}) {
  const rows = materialized.map((state) => {
    const slo = slos.get(state.transactionId) || null;
    return {
      transactionId: state.transactionId,
      sourceIssue: state.sourceIssue,
      project: state.project,
      lane: state.lane,
      pr: state.pr,
      candidateSha: state.candidateSha,
      currentStage: state.currentStage,
      currentPhase: state.currentPhase,
      owner: state.owner,
      ageMs: state.ageMs,
      totalAgeMs: state.totalAgeMs,
      workflowStatus: state.workflowStatus,
      evidenceQuality: state.evidenceQuality,
      blockerClass: state.blockerClass,
      nextExpectedAction: state.nextExpectedAction,
      lastSuccessfulTransition: state.lastSuccessfulTransition,
      executableButIdleMs: slo?.executableButIdleMs ?? null,
      sloBreach: slo?.sloBreach ?? null,
    };
  });

  rows.sort((a, b) => {
    const active = (s) => (s.workflowStatus === 'complete' ? 1 : 0);
    if (active(a) !== active(b)) return active(a) - active(b);
    return (b.ageMs ?? -1) - (a.ageMs ?? -1);
  });

  return {
    transactionCount: rows.length,
    activeCount: rows.filter((r) => r.workflowStatus !== 'complete').length,
    transactions: rows,
  };
}

/**
 * Exceptions: SLO breaches, protected/blocked stops, stale evidence, and
 * evidence-missing conditions — each linking exact issues, PRs, and evidence.
 */
export function buildExceptionsView({
  materialized = [],
  slos = new Map(),
  active = [],
  nowMs = Date.now(),
  staleAfterMs = 24 * 60 * 60 * 1000,
} = {}) {
  const sloBreaches = [];
  for (const state of materialized) {
    const slo = slos.get(state.transactionId);
    for (const breach of slo?.breaches || []) {
      sloBreaches.push({
        transactionId: state.transactionId,
        sourceIssue: breach.sourceIssue ?? state.sourceIssue,
        pr: breach.pr ?? state.pr,
        kind: breach.kind,
        stage: breach.stage,
        deadline: breach.deadline,
        breachedAt: breach.breachedAt,
        evidenceRef: breach.evidenceRef ?? null,
        informational: breach.informational !== false,
      });
    }
  }

  const protectedStops = active
    .filter((e) => e.phase === 'blocked' || e.result === 'blocked')
    .map((e) => ({
      transactionId: e.transactionId,
      sourceIssue: e.sourceIssue,
      pr: e.pr,
      stage: e.stage,
      blockerClass: e.blockerClass,
      occurredAt: e.occurredAt,
      actorComponent: e.actorComponent,
      evidenceRef: evidenceRefOf(e),
    }));

  const evidenceMissing = materialized
    .filter((s) => s.evidenceQuality === 'unknown_evidence_missing' && s.workflowStatus !== 'complete')
    .map((s) => ({
      transactionId: s.transactionId,
      sourceIssue: s.sourceIssue,
      pr: s.pr,
      currentStage: s.currentStage,
      owner: s.owner,
      condition: 'unknown_evidence_missing',
    }));

  const staleTransactions = materialized
    .filter(
      (s) =>
        s.workflowStatus !== 'complete' &&
        s.ageMs != null &&
        s.ageMs > staleAfterMs,
    )
    .map((s) => ({
      transactionId: s.transactionId,
      sourceIssue: s.sourceIssue,
      pr: s.pr,
      currentStage: s.currentStage,
      owner: s.owner,
      ageMs: s.ageMs,
      staleAfterMs,
    }));

  return {
    exceptionCount:
      sloBreaches.length + protectedStops.length + evidenceMissing.length + staleTransactions.length,
    sloBreaches,
    protectedStops,
    evidenceMissing,
    staleTransactions,
    referenceNowMs: nowMs,
  };
}

/**
 * Daily Performance: transition durations, completion throughput, and idle
 * time per UTC day.
 */
export function buildDailyPerformanceView({
  active = [],
  materialized = [],
  slos = new Map(),
  now = new Date().toISOString(),
} = {}) {
  const durations = computeTransitionDurations(active);
  const days = new Map();

  const dayEntry = (day) => {
    if (!days.has(day)) {
      days.set(day, {
        date: day,
        transitions: 0,
        completedTransactions: 0,
        durationsMs: [],
      });
    }
    return days.get(day);
  };

  for (const event of active) {
    if (event.phase !== 'end') continue;
    const day = utcDayOf(event.occurredAt);
    if (!day) continue;
    dayEntry(day).transitions += 1;
    if (event.stage === 'continuation' && event.result === 'pass') {
      dayEntry(day).completedTransactions += 1;
    }
  }
  for (const duration of durations) {
    const day = utcDayOf(duration.endedAt);
    if (day) dayEntry(day).durationsMs.push(duration.durationMs);
  }

  const rows = [...days.values()]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((entry) => {
      const sorted = [...entry.durationsMs].sort((a, b) => a - b);
      return {
        date: entry.date,
        transitions: entry.transitions,
        completedTransactions: entry.completedTransactions,
        medianTransitionMs: percentile(sorted, 0.5),
        maxTransitionMs: sorted.length ? sorted[sorted.length - 1] : null,
      };
    });

  // Idle time is a current-state snapshot attributed to the generation day;
  // historical idle reconstruction is reconciliation-lane work (#2889).
  const currentIdleMs = materialized.reduce(
    (sum, state) => sum + (slos.get(state.transactionId)?.executableButIdleMs || 0),
    0,
  );

  return {
    days: rows,
    snapshotDate: utcDayOf(typeof now === 'string' ? now : now.toISOString()),
    currentExecutableButIdleMs: currentIdleMs,
  };
}

/**
 * Two-Week Trend: transition-duration percentiles, failure categories, and
 * improvement direction over the trailing window.
 */
export function buildTwoWeekTrendView({
  active = [],
  now = new Date().toISOString(),
  windowDays = TREND_WINDOW_DAYS,
} = {}) {
  const nowMs = Date.parse(typeof now === 'string' ? now : now.toISOString());
  const windowStartMs = nowMs - windowDays * 24 * 60 * 60 * 1000;
  const inWindow = active.filter((e) => {
    const at = Date.parse(e.occurredAt);
    return Number.isFinite(at) && at >= windowStartMs && at <= nowMs;
  });

  const durations = computeTransitionDurations(inWindow);
  const sortedAll = durations.map((d) => d.durationMs).sort((a, b) => a - b);

  const perStage = {};
  for (const stage of REQUIRED_STAGE_IDS) {
    const stageDurations = durations
      .filter((d) => d.stage === stage)
      .map((d) => d.durationMs)
      .sort((a, b) => a - b);
    perStage[stage] = {
      count: stageDurations.length,
      p50Ms: percentile(stageDurations, 0.5),
      p90Ms: percentile(stageDurations, 0.9),
    };
  }

  const failureCategories = {};
  for (const event of inWindow) {
    if (event.result !== 'fail' && event.result !== 'blocked') continue;
    const category = event.blockerClass || 'unknown';
    failureCategories[category] = (failureCategories[category] || 0) + 1;
  }

  // Improvement direction: compare median transition duration in the older
  // half of the window against the newer half.
  const midpointMs = nowMs - (windowDays / 2) * 24 * 60 * 60 * 1000;
  const olderHalf = durations
    .filter((d) => Date.parse(d.endedAt) < midpointMs)
    .map((d) => d.durationMs)
    .sort((a, b) => a - b);
  const newerHalf = durations
    .filter((d) => Date.parse(d.endedAt) >= midpointMs)
    .map((d) => d.durationMs)
    .sort((a, b) => a - b);
  const olderMedian = percentile(olderHalf, 0.5);
  const newerMedian = percentile(newerHalf, 0.5);
  let improvementDirection = 'unknown';
  if (olderMedian != null && newerMedian != null) {
    if (newerMedian <= olderMedian * 0.9) improvementDirection = 'improving';
    else if (newerMedian >= olderMedian * 1.1) improvementDirection = 'degrading';
    else improvementDirection = 'flat';
  }

  return {
    windowDays,
    windowStart: new Date(windowStartMs).toISOString(),
    windowEnd: new Date(nowMs).toISOString(),
    transitionCount: durations.length,
    p50Ms: percentile(sortedAll, 0.5),
    p90Ms: percentile(sortedAll, 0.9),
    perStage,
    failureCategories,
    improvementDirection,
  };
}

/**
 * Component Health: runner, Bridge, controller, Cursor, checks, and closeout
 * reported separately. One failing component is never misreported as total
 * workflow failure; components without evidence stay explicitly `unknown`.
 */
export function buildComponentHealthView({ materialized = [] } = {}) {
  const components = {};
  for (const component of ACTOR_COMPONENTS) {
    components[component] = {
      status: 'unknown',
      lastResult: null,
      lastAt: null,
      blockerClass: null,
      degradedTransactions: [],
    };
  }

  for (const state of materialized) {
    for (const [component, slot] of Object.entries(state.componentStatus || {})) {
      const agg = components[component];
      if (!agg) continue;
      if (slot.lastAt && (!agg.lastAt || Date.parse(slot.lastAt) >= Date.parse(agg.lastAt))) {
        agg.lastAt = slot.lastAt;
        agg.lastResult = slot.lastResult;
        agg.blockerClass = slot.blockerClass;
      }
      if (slot.status === 'degraded') {
        agg.status = 'degraded';
        agg.degradedTransactions.push({
          transactionId: state.transactionId,
          sourceIssue: state.sourceIssue,
          pr: state.pr,
        });
      } else if (slot.status === 'healthy' && agg.status !== 'degraded') {
        agg.status = 'healthy';
      }
    }
  }

  const degraded = Object.entries(components)
    .filter(([, v]) => v.status === 'degraded')
    .map(([name]) => name);

  return {
    components,
    degradedComponents: degraded,
    // Explicit contract: component degradation is scoped, not global.
    totalWorkflowFailure: false,
  };
}

/**
 * Build all five views from one raw envelope set. Every view derives from
 * the same ingested/materialized event model. The result is always complete:
 * all five view keys exist even with zero events, and unknown states remain
 * visible rather than being reported healthy.
 *
 * @param {{ events?: object[], now?: string|Date, sloConfig?: object, staleAfterMs?: number }} params
 */
export function buildHealthViews({
  events = [],
  now = new Date().toISOString(),
  sloConfig = {},
  staleAfterMs = 24 * 60 * 60 * 1000,
} = {}) {
  const nowIso = typeof now === 'string' ? now : now.toISOString();
  const nowMs = Date.parse(nowIso);

  const ingested = ingestEvents([], events);
  const materialized = materializeAllTransactions({ events: ingested.events, now: nowIso });
  const slos = new Map(
    materialized.map((state) => [
      state.transactionId,
      evaluateSlo({
        events: ingested.events.filter((e) => e.transactionId === state.transactionId),
        state,
        now: nowIso,
        config: sloConfig,
      }),
    ]),
  );

  const views = {
    schemaVersion: VIEWS_SCHEMA_VERSION,
    generatedAt: nowIso,
    eventCount: ingested.events.length,
    activeEventCount: ingested.active.length,
    rejectedEventCount: ingested.rejected.length,
    dataState: ingested.events.length === 0 ? 'no_events_unknown' : 'derived',
    liveFlow: buildLiveFlowView({ materialized, slos }),
    exceptions: buildExceptionsView({
      materialized,
      slos,
      active: ingested.active,
      nowMs,
      staleAfterMs,
    }),
    dailyPerformance: buildDailyPerformanceView({
      active: ingested.active,
      materialized,
      slos,
      now: nowIso,
    }),
    twoWeekTrend: buildTwoWeekTrendView({ active: ingested.active, now: nowIso }),
    componentHealth: buildComponentHealthView({ materialized }),
    // Hard guarantee for acceptance criteria.
    mutatesExecutionAuthority: false,
  };

  return redactDeep(views);
}
