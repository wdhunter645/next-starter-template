#!/usr/bin/env node
/**
 * Retention and pruning for workflow-health generated artifacts.
 * Prunes detailed envelopes after 30 days and daily aggregates after 13 months.
 * Never deletes authoritative GitHub Issues, PRs, comments, or evidence —
 * only in-memory / on-disk derived stores. Work unit #2889 / parent #2680.
 */

import {
  AGGREGATE_RETENTION_MONTHS,
  DETAIL_RETENTION_DAYS,
} from './config.mjs';

function toMs(now) {
  return typeof now === 'string' ? Date.parse(now) : now.getTime();
}

function monthsToMs(months) {
  // Contract uses calendar-approximate months (30-day units) so pruning is
  // deterministic across environments without locale calendars.
  return Number(months) * 30 * 24 * 60 * 60 * 1000;
}

function daysToMs(days) {
  return Number(days) * 24 * 60 * 60 * 1000;
}

/**
 * Return the canonical UTC day (YYYY-MM-DD) for an aggregate row date, or
 * null when the value is malformed. Malformed dates must not survive
 * retention by sorting after the cutoff string.
 */
function canonicalUtcDay(value) {
  if (typeof value !== 'string') return null;
  // Exact YYYY-MM-DD only — do not slice prefixes off malformed values such as
  // `2026-07-01garbage`, which would otherwise survive retention forever.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return null;
  }
  return value;
}

/**
 * Keep detailed events whose occurredAt is within the retention window.
 * Events without a parseable timestamp are dropped from the derived store
 * (they are already invalid for materialization) but never imply GitHub
 * deletion.
 *
 * @param {object[]} events
 * @param {string|Date} now
 * @param {number} [retentionDays]
 */
export function pruneDetailedEvents(
  events = [],
  now = new Date().toISOString(),
  retentionDays = DETAIL_RETENTION_DAYS,
) {
  const cutoffMs = toMs(now) - daysToMs(retentionDays);
  const kept = [];
  const pruned = [];
  for (const event of events) {
    const at = Date.parse(event?.occurredAt);
    if (!Number.isFinite(at) || at < cutoffMs) {
      pruned.push(event?.idempotencyKey ?? null);
      continue;
    }
    kept.push(event);
  }
  return {
    events: kept,
    prunedCount: pruned.length,
    prunedKeys: pruned,
    cutoffIso: new Date(cutoffMs).toISOString(),
    retentionDays,
    // Hard guarantee: pruning touches derived stores only.
    deletesAuthoritativeEvidence: false,
  };
}

/**
 * Keep daily aggregate rows whose `date` (UTC YYYY-MM-DD) is within the
 * retention window.
 *
 * @param {object[]} aggregates
 * @param {string|Date} now
 * @param {number} [retentionMonths]
 */
export function pruneDailyAggregates(
  aggregates = [],
  now = new Date().toISOString(),
  retentionMonths = AGGREGATE_RETENTION_MONTHS,
) {
  const cutoffMs = toMs(now) - monthsToMs(retentionMonths);
  const cutoffDay = new Date(cutoffMs).toISOString().slice(0, 10);
  const kept = [];
  let prunedCount = 0;
  for (const row of aggregates) {
    const day = canonicalUtcDay(row?.date);
    if (!day || day < cutoffDay) {
      prunedCount += 1;
      continue;
    }
    kept.push(row);
  }
  return {
    aggregates: kept,
    prunedCount,
    cutoffDay,
    retentionMonths,
    deletesAuthoritativeEvidence: false,
  };
}

/**
 * Merge a fresh daily-performance snapshot into the durable aggregate store.
 * Existing rows for the same UTC date are replaced; older rows are retained
 * until pruneDailyAggregates runs.
 *
 * @param {object[]} existing
 * @param {{ days?: object[], snapshotDate?: string|null, currentExecutableButIdleMs?: number }} dailyPerformance
 */
export function upsertDailyAggregates(existing = [], dailyPerformance = {}) {
  const byDate = new Map();
  for (const row of existing) {
    if (row?.date) byDate.set(row.date, { ...row });
  }
  for (const row of dailyPerformance.days || []) {
    if (!row?.date) continue;
    byDate.set(row.date, {
      date: row.date,
      transitions: row.transitions ?? 0,
      completedTransactions: row.completedTransactions ?? 0,
      medianTransitionMs: row.medianTransitionMs ?? null,
      maxTransitionMs: row.maxTransitionMs ?? null,
    });
  }
  // Attribute the current idle snapshot to the generation day when present.
  if (dailyPerformance.snapshotDate) {
    const snap = byDate.get(dailyPerformance.snapshotDate) || {
      date: dailyPerformance.snapshotDate,
      transitions: 0,
      completedTransactions: 0,
      medianTransitionMs: null,
      maxTransitionMs: null,
    };
    snap.executableButIdleMs = dailyPerformance.currentExecutableButIdleMs ?? 0;
    byDate.set(dailyPerformance.snapshotDate, snap);
  }

  return [...byDate.values()].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
}
