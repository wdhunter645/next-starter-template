/**
 * Runtime configuration for workflow-health reconciliation and retention.
 * Disable flips derived-state generation off without deleting authoritative
 * GitHub Issues, PRs, comments, or evidence. Work unit #2889 / parent #2680.
 */

import { DEFAULT_SLO_CONFIG } from './slo.mjs';

/** Detailed envelope retention window (days). */
export const DETAIL_RETENTION_DAYS = 30;

/** Daily aggregate retention window (months ≈ 30-day months for pruning). */
export const AGGREGATE_RETENTION_MONTHS = 13;

export const DEFAULT_RECONCILE_CONFIG = Object.freeze({
  enabled: true,
  watcherIntervalMinutes: DEFAULT_SLO_CONFIG.watcherIntervalMinutes,
  detailRetentionDays: DETAIL_RETENTION_DAYS,
  aggregateRetentionMonths: AGGREGATE_RETENTION_MONTHS,
  /** When true, reconciliation forces inventory-gap unknown events. */
  emitGaps: true,
  staleAfterMs: 24 * 60 * 60 * 1000,
});

/**
 * Resolve config from overrides and environment.
 * `WORKFLOW_HEALTH_DISABLED=1|true|yes` disables generation (rollback/disable).
 *
 * @param {Partial<typeof DEFAULT_RECONCILE_CONFIG>} [overrides]
 */
export function resolveReconcileConfig(overrides = {}) {
  const envDisabled = ['1', 'true', 'yes'].includes(
    String(process.env.WORKFLOW_HEALTH_DISABLED || '').toLowerCase(),
  );
  return {
    enabled: overrides.enabled ?? !envDisabled,
    watcherIntervalMinutes:
      overrides.watcherIntervalMinutes ?? DEFAULT_RECONCILE_CONFIG.watcherIntervalMinutes,
    detailRetentionDays:
      overrides.detailRetentionDays ?? DEFAULT_RECONCILE_CONFIG.detailRetentionDays,
    aggregateRetentionMonths:
      overrides.aggregateRetentionMonths ?? DEFAULT_RECONCILE_CONFIG.aggregateRetentionMonths,
    emitGaps: overrides.emitGaps ?? DEFAULT_RECONCILE_CONFIG.emitGaps,
    staleAfterMs: overrides.staleAfterMs ?? DEFAULT_RECONCILE_CONFIG.staleAfterMs,
  };
}
