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
      { date: '2026-07-01garbage', transitions: 1 },
      { date: '2026-07-01', transitions: 2 },
    ];
    const pruned = pruneDailyAggregates(aggregates, NOW, AGGREGATE_RETENTION_MONTHS);
    expect(pruned.prunedCount).toBe(3);
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
    // Remediation is optional; gaps for its evidence-missing end boundary emit
    // only after the stage is entered.
    const first = event({
      stage: 'remediation',
      phase: 'start',
      idempotencyKey: 'same-key',
    });
    const duplicate = event({
      stage: 'remediation',
      phase: 'start',
      idempotencyKey: 'same-key',
    });
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

  it('fails closed on a corrupt prior store without overwriting it', () => {
    const prior = [{ not: 'valid-store-event' }];
    const result = reconcileDerivedState({
      existingEvents: prior,
      incomingEvents: [event({ idempotencyKey: 'new-1' })],
      now: NOW,
      writeViews: true,
      outDir: mkdtempSync(join(tmpdir(), 'wh-corrupt-')),
      config: { emitGaps: false },
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('corrupt_prior_store');
    expect(result.written).toBeNull();
    expect(result.events).toEqual(prior);
    expect(result.repairs.storeRejectedCount).toBe(1);
  });

  it('preserves custom transactionId and stale age when emitting gaps', () => {
    const customId = 'custom-tx-42';
    const seed = event({
      transactionId: customId,
      sourceIssue: 42,
      stage: 'execution',
      phase: 'start',
      occurredAt: '2026-07-20T12:00:00.000Z',
      idempotencyKey: 'stale-start',
    });
    const result = reconcileDerivedState({
      existingEvents: [seed],
      incomingEvents: [],
      now: NOW,
      config: { emitGaps: true, staleAfterMs: 24 * 60 * 60 * 1000 },
    });
    expect(result.ok).toBe(true);
    expect(result.events.every((e) => e.transactionId === customId)).toBe(true);
    // Remediation is optional — must not force unknown on every transaction.
    expect(result.events.some((e) => e.stage === 'remediation')).toBe(false);
    const live = result.views.liveFlow.transactions.find((r) => r.transactionId === customId);
    expect(live).toBeTruthy();
    expect(live.ageMs).toBeGreaterThan(24 * 60 * 60 * 1000);
    expect(
      result.views.exceptions.staleTransactions.some((r) => r.transactionId === customId),
    ).toBe(true);
  });

  it('keeps stale visibility after detail retention prunes old real evidence', () => {
    const customId = 'stale-beyond-retention';
    const seed = event({
      transactionId: customId,
      sourceIssue: 77,
      stage: 'execution',
      phase: 'start',
      occurredAt: '2026-06-01T12:00:00.000Z',
      idempotencyKey: 'ancient-start',
    });
    const result = reconcileDerivedState({
      existingEvents: [seed],
      incomingEvents: [],
      now: NOW,
      config: { emitGaps: true, staleAfterMs: 24 * 60 * 60 * 1000 },
    });
    expect(result.ok).toBe(true);
    expect(result.events.some((e) => e.idempotencyKey === 'ancient-start')).toBe(false);
    expect(result.transactionSummaries.some((s) => s.transactionId === customId)).toBe(true);
    expect(
      result.views.exceptions.staleTransactions.some((r) => r.transactionId === customId),
    ).toBe(true);
  });

  it('publishes retained daily aggregates into the Daily Performance view', () => {
    const result = reconcileDerivedState({
      existingEvents: [event({ idempotencyKey: 'agg-1', occurredAt: '2026-08-01T10:00:00.000Z' })],
      incomingEvents: [],
      dailyAggregates: [
        { date: '2026-07-01', transitions: 4, completedTransactions: 1, medianTransitionMs: 9, maxTransitionMs: 11 },
      ],
      now: NOW,
      config: { emitGaps: false },
    });
    expect(result.views.dailyPerformance.days.some((d) => d.date === '2026-07-01' && d.transitions === 4)).toBe(
      true,
    );
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
    const seeds = [
      event({
        sourceIssue: 1,
        transactionId: transactionIdFor(1, 'a'),
        stage: 'remediation',
        phase: 'start',
        idempotencyKey: 'a',
      }),
      event({
        sourceIssue: 2,
        transactionId: 'custom-b',
        stage: 'remediation',
        phase: 'start',
        idempotencyKey: 'b',
      }),
    ];
    const scopes = transactionScopesFromEvents(seeds);
    expect(scopes).toHaveLength(2);
    expect(scopes.map((s) => s.transactionId).sort()).toEqual(
      ['custom-b', transactionIdFor(1, 'a')].sort(),
    );
    const gaps = emitReconciliationGaps({ events: seeds, now: NOW });
    expect(gaps.events.length).toBeGreaterThan(0);
    expect(gaps.events.every((e) => e.evidenceQuality === 'unknown_evidence_missing')).toBe(true);
    expect(gaps.events.every((e) => e.result === 'unknown')).toBe(true);
    expect(gaps.events.every((e) => e.stage === 'remediation')).toBe(true);
    expect(new Set(gaps.events.map((e) => e.transactionId))).toEqual(
      new Set(scopes.map((s) => s.transactionId)),
    );
  });

  it('pilot classification succeeds even when WORKFLOW_HEALTH_DISABLED is set', () => {
    const prior = process.env.WORKFLOW_HEALTH_DISABLED;
    process.env.WORKFLOW_HEALTH_DISABLED = 'yes';
    try {
      const result = runPilot({ now: NOW });
      expect(result.ok).toBe(true);
    } finally {
      if (prior === undefined) delete process.env.WORKFLOW_HEALTH_DISABLED;
      else process.env.WORKFLOW_HEALTH_DISABLED = prior;
    }
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
