import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildEnvelope, transactionIdFor } from '../../scripts/workflow-health/envelope.mjs';
import {
  DETAIL_RETENTION_DAYS,
  AGGREGATE_RETENTION_MONTHS,
  resolveReconcileConfig,
} from '../../scripts/workflow-health/config.mjs';
import {
  pruneDailyAggregates,
  pruneDetailedEvents,
  upsertDailyAggregates,
} from '../../scripts/workflow-health/retention.mjs';
import {
  emitReconciliationGaps,
  reconcileDerivedState,
  transactionScopesFromEvents,
} from '../../scripts/workflow-health/reconcile.mjs';
import { buildPilotSeedEvents, runPilot } from '../../scripts/workflow-health/pilot.mjs';

const NOW = '2026-08-01T18:00:00.000Z';

function event(overrides = {}) {
  const built = buildEnvelope({
    transactionId: transactionIdFor(100, '1'),
    sourceIssue: 100,
    project: 2680,
    lane: 'development',
    stage: 'delivery',
    phase: 'end',
    occurredAt: '2026-08-01T12:00:00.000Z',
    actor: 'tester',
    actorComponent: 'bridge',
    result: 'pass',
    evidenceQuality: 'deterministic',
    idempotencyKey: overrides.idempotencyKey || `k-${Math.random().toString(16).slice(2)}`,
    evidence: {
      channel: 'issue_comment',
      ref: 'https://github.com/example/issues/100#issuecomment-1',
      marker: 'TEST',
    },
    ...overrides,
  });
  expect(built.ok).toBe(true);
  return built.event;
}

describe('workflow-health retention (#2889)', () => {
  it('prunes detailed events older than 30 days without deleting authoritative evidence', () => {
    const events = [
      event({ occurredAt: '2026-06-01T00:00:00.000Z', idempotencyKey: 'old' }),
      event({ occurredAt: '2026-07-20T00:00:00.000Z', idempotencyKey: 'keep' }),
    ];
    const pruned = pruneDetailedEvents(events, NOW, DETAIL_RETENTION_DAYS);
    expect(pruned.deletesAuthoritativeEvidence).toBe(false);
    expect(pruned.prunedCount).toBe(1);
    expect(pruned.events.map((e) => e.idempotencyKey)).toEqual(['keep']);
  });

  it('prunes daily aggregates older than 13 months', () => {
    const aggregates = [
      { date: '2024-01-01', transitions: 1 },
      { date: '2026-07-01', transitions: 2 },
    ];
    const pruned = pruneDailyAggregates(aggregates, NOW, AGGREGATE_RETENTION_MONTHS);
    expect(pruned.deletesAuthoritativeEvidence).toBe(false);
    expect(pruned.prunedCount).toBe(1);
    expect(pruned.aggregates.map((r) => r.date)).toEqual(['2026-07-01']);
  });

  it('prunes malformed aggregate dates instead of retaining them forever', () => {
    const aggregates = [
      { date: 'not-a-date', transitions: 1 },
      { date: 'zzzz-99-99', transitions: 1 },
      { date: '2026-07-01', transitions: 2 },
    ];
    const pruned = pruneDailyAggregates(aggregates, NOW, AGGREGATE_RETENTION_MONTHS);
    expect(pruned.prunedCount).toBe(2);
    expect(pruned.aggregates.map((r) => r.date)).toEqual(['2026-07-01']);
  });

  it('upserts daily aggregates by UTC date and records idle snapshot', () => {
    const merged = upsertDailyAggregates(
      [{ date: '2026-08-01', transitions: 1, completedTransactions: 0 }],
      {
        snapshotDate: '2026-08-01',
        currentExecutableButIdleMs: 120000,
        days: [{ date: '2026-08-01', transitions: 3, completedTransactions: 1, medianTransitionMs: 10, maxTransitionMs: 20 }],
      },
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].transitions).toBe(3);
    expect(merged[0].executableButIdleMs).toBe(120000);
  });
});

describe('workflow-health reconcile (#2889)', () => {
  it('deduplicates on ingest and forces gap emission when enabled', () => {
    const first = event({ idempotencyKey: 'same-key' });
    const duplicate = event({ idempotencyKey: 'same-key' });
    const result = reconcileDerivedState({
      existingEvents: [first],
      incomingEvents: [duplicate],
      now: NOW,
      config: { emitGaps: true },
    });
    expect(result.mutatesExecutionAuthority).toBe(false);
    expect(result.deletesAuthoritativeEvidence).toBe(false);
    expect(result.repairs.duplicatesSuppressed).toBe(1);
    expect(result.repairs.gapsEmitted).toBeGreaterThan(0);
    expect(result.views.exceptions.evidenceMissing.length).toBeGreaterThan(0);
  });

  it('fails the pass when incoming envelopes are rejected on first ingest', () => {
    const result = reconcileDerivedState({
      existingEvents: [],
      incomingEvents: [{ not: 'an-envelope' }],
      now: NOW,
      config: { emitGaps: false },
    });
    expect(result.ok).toBe(false);
    expect(result.repairs.rejectedCount).toBeGreaterThan(0);
  });

  it('disable path skips generation and preserves events', () => {
    const prior = [event({ idempotencyKey: 'keep-me' })];
    const result = reconcileDerivedState({
      existingEvents: prior,
      incomingEvents: [event({ idempotencyKey: 'ignored-when-disabled' })],
      now: NOW,
      config: { enabled: false },
    });
    expect(result.disabled).toBe(true);
    expect(result.views).toBeNull();
    expect(result.events).toHaveLength(1);
    expect(result.events[0].idempotencyKey).toBe('keep-me');
    expect(result.deletesAuthoritativeEvidence).toBe(false);
  });

  it('writes static views and store when writeViews is true', () => {
    const outDir = mkdtempSync(join(tmpdir(), 'wh-reconcile-'));
    const result = reconcileDerivedState({
      existingEvents: [],
      incomingEvents: [event({ idempotencyKey: 'write-1' })],
      now: NOW,
      writeViews: true,
      outDir,
      config: { emitGaps: false },
    });
    expect(existsSync(join(outDir, 'health-data.json'))).toBe(true);
    expect(existsSync(join(outDir, 'reconcile-store.json'))).toBe(true);
    const store = JSON.parse(readFileSync(join(outDir, 'reconcile-store.json'), 'utf8'));
    expect(store.deletesAuthoritativeEvidence).toBe(false);
    expect(store.events.length).toBeGreaterThan(0);
    expect(result.written.dataPath).toContain('health-data.json');
  });

  it('scopes gap emission per known transaction', () => {
    const scopes = transactionScopesFromEvents([
      event({ sourceIssue: 1, transactionId: transactionIdFor(1, 'a'), idempotencyKey: 'a' }),
      event({ sourceIssue: 2, transactionId: transactionIdFor(2, 'b'), idempotencyKey: 'b' }),
    ]);
    expect(scopes).toHaveLength(2);
    const gaps = emitReconciliationGaps({
      events: scopes.map((s) =>
        event({
          sourceIssue: s.sourceIssue,
          transactionId: transactionIdFor(s.sourceIssue, s.workUnitId),
          idempotencyKey: `seed-${s.sourceIssue}`,
        }),
      ),
      now: NOW,
    });
    expect(gaps.events.length).toBeGreaterThan(0);
    expect(gaps.events.every((e) => e.evidenceQuality === 'unknown_evidence_missing')).toBe(true);
    expect(gaps.events.every((e) => e.result === 'unknown')).toBe(true);
  });

  it('honors WORKFLOW_HEALTH_DISABLED via resolveReconcileConfig', () => {
    const prior = process.env.WORKFLOW_HEALTH_DISABLED;
    process.env.WORKFLOW_HEALTH_DISABLED = 'true';
    try {
      expect(resolveReconcileConfig().enabled).toBe(false);
    } finally {
      if (prior === undefined) delete process.env.WORKFLOW_HEALTH_DISABLED;
      else process.env.WORKFLOW_HEALTH_DISABLED = prior;
    }
  });
});

describe('workflow-health pilot (#2889)', () => {
  it('classifies seeded failures, idle, stale, missing evidence, disable, and rollback', () => {
    const result = runPilot({ now: NOW });
    expect(result.paidServiceIntroduced).toBe(false);
    expect(result.mutatesExecutionAuthority).toBe(false);
    expect(result.deletesAuthoritativeEvidence).toBe(false);
    expect(result.ok).toBe(true);
    for (const c of result.classification.cases) {
      expect(c.ok, c.id).toBe(true);
    }
    for (const c of result.disableRollback.cases) {
      expect(c.ok, c.id).toBe(true);
    }
  });

  it('seed builder emits multi-case envelope set', () => {
    const seed = buildPilotSeedEvents({ now: NOW });
    expect(seed.events.length).toBeGreaterThan(5);
    expect(seed.cases.idleIssue).toBe(9101);
  });
});
