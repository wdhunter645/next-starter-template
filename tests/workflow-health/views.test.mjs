import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildEnvelope, transactionIdFor } from '../../scripts/workflow-health/envelope.mjs';
import { ACTOR_COMPONENTS } from '../../scripts/workflow-health/event-inventory.mjs';
import { buildStaticViews } from '../../scripts/workflow-health/build-views.mjs';
import {
  VIEWS_SCHEMA_VERSION,
  buildHealthViews,
  computeTransitionDurations,
  redactSensitive,
} from '../../scripts/workflow-health/views.mjs';

const NOW = '2026-08-01T12:00:00.000Z';

let keyCounter = 0;
function event(overrides = {}) {
  const built = buildEnvelope({
    transactionId: transactionIdFor(100, '1'),
    sourceIssue: 100,
    project: 2680,
    lane: 'development',
    pr: null,
    candidateSha: null,
    stage: 'authority_ready',
    phase: 'end',
    occurredAt: '2026-08-01T10:00:00.000Z',
    actor: 'tester',
    actorComponent: 'cursor',
    result: 'pass',
    blockerClass: null,
    nextExpectedAction: null,
    sloDeadline: null,
    idempotencyKey: `k-${(keyCounter += 1)}`,
    supersedes: null,
    evidence: {
      channel: 'issue_comment',
      ref: 'https://github.com/wdhunter645/next-starter-template/issues/100#issuecomment-1',
      marker: 'TEST MARKER',
    },
    evidenceQuality: 'deterministic',
    ...overrides,
  });
  expect(built.ok, JSON.stringify(built.errors)).toBe(true);
  return built.event;
}

describe('workflow-health views (#2888)', () => {
  it('always produces all five views, even with zero events, as unknown not healthy', () => {
    const views = buildHealthViews({ events: [], now: NOW });
    expect(views.schemaVersion).toBe(VIEWS_SCHEMA_VERSION);
    expect(views.dataState).toBe('no_events_unknown');
    for (const key of ['liveFlow', 'exceptions', 'dailyPerformance', 'twoWeekTrend', 'componentHealth']) {
      expect(views[key], key).toBeTruthy();
    }
    for (const component of ACTOR_COMPONENTS) {
      expect(views.componentHealth.components[component].status).toBe('unknown');
    }
    expect(views.liveFlow.transactions).toEqual([]);
    expect(views.mutatesExecutionAuthority).toBe(false);
  });

  it('derives Live Flow (stage, owner, age, next action) from the shared event model', () => {
    const views = buildHealthViews({
      events: [event({ occurredAt: '2026-08-01T10:00:00.000Z' })],
      now: NOW,
    });
    expect(views.liveFlow.transactionCount).toBe(1);
    const row = views.liveFlow.transactions[0];
    expect(row.sourceIssue).toBe(100);
    expect(row.currentStage).toBe('authority_ready');
    expect(row.owner).toBe('pmo_engineering');
    expect(row.ageMs).toBe(2 * 60 * 60 * 1000);
    expect(row.nextExpectedAction).toEqual({ owner: 'deterministic_ci', action: 'begin_delivery' });
    expect(row.workflowStatus).toBe('in_progress');
  });

  it('reports SLO breaches in Exceptions with exact issue and evidence links', () => {
    // Authority ready ended at 10:00; no pickup evidence within the 5-minute
    // watcher interval and none since — informational breach.
    const views = buildHealthViews({
      events: [event({ occurredAt: '2026-08-01T10:00:00.000Z' })],
      now: NOW,
    });
    expect(views.exceptions.sloBreaches.length).toBeGreaterThan(0);
    const breach = views.exceptions.sloBreaches.find((b) => b.kind === 'pickup_visibility');
    expect(breach.sourceIssue).toBe(100);
    expect(breach.evidenceRef).toContain('github.com');
    expect(breach.informational).toBe(true);
  });

  it('keeps protected stops and evidence-missing conditions visible', () => {
    const views = buildHealthViews({
      events: [
        event({
          stage: 'integration',
          phase: 'blocked',
          result: 'blocked',
          blockerClass: 'integration',
          occurredAt: '2026-08-01T11:00:00.000Z',
          transactionId: transactionIdFor(200, '1'),
          sourceIssue: 200,
        }),
        event({
          stage: 'authority_ready',
          phase: 'unknown',
          result: 'unknown',
          evidenceQuality: 'unknown_evidence_missing',
          evidence: { channel: null, ref: null, marker: null },
          occurredAt: '2026-08-01T11:00:00.000Z',
          transactionId: transactionIdFor(300, '1'),
          sourceIssue: 300,
        }),
      ],
      now: NOW,
    });
    expect(views.exceptions.protectedStops).toHaveLength(1);
    expect(views.exceptions.protectedStops[0]).toMatchObject({ sourceIssue: 200, blockerClass: 'integration' });
    expect(views.exceptions.evidenceMissing.some((m) => m.sourceIssue === 300)).toBe(true);
  });

  it('never reports one degraded component as total workflow failure', () => {
    const views = buildHealthViews({
      events: [
        event({ actorComponent: 'bridge', result: 'fail', phase: 'blocked', blockerClass: 'eligibility', stage: 'eligibility', occurredAt: '2026-08-01T11:00:00.000Z' }),
        event({ actorComponent: 'cursor', result: 'pass', stage: 'authority_ready', occurredAt: '2026-08-01T10:00:00.000Z' }),
      ],
      now: NOW,
    });
    expect(views.componentHealth.components.bridge.status).toBe('degraded');
    expect(views.componentHealth.components.cursor.status).toBe('healthy');
    expect(views.componentHealth.components.controller.status).toBe('unknown');
    expect(views.componentHealth.degradedComponents).toEqual(['bridge']);
    expect(views.componentHealth.totalWorkflowFailure).toBe(false);
  });

  it('computes daily transitions, completions, and transition durations', () => {
    const tx = transactionIdFor(400, '1');
    const views = buildHealthViews({
      events: [
        event({ transactionId: tx, sourceIssue: 400, stage: 'execution', phase: 'start', result: 'pass', occurredAt: '2026-07-30T10:00:00.000Z' }),
        event({ transactionId: tx, sourceIssue: 400, stage: 'execution', phase: 'end', result: 'pass', occurredAt: '2026-07-30T11:30:00.000Z' }),
        event({ transactionId: tx, sourceIssue: 400, stage: 'continuation', phase: 'end', result: 'pass', occurredAt: '2026-07-30T12:00:00.000Z' }),
      ],
      now: NOW,
    });
    const day = views.dailyPerformance.days.find((d) => d.date === '2026-07-30');
    expect(day.transitions).toBe(2);
    expect(day.completedTransactions).toBe(1);
    expect(day.medianTransitionMs).toBe(90 * 60 * 1000);
  });

  it('restricts the two-week trend to its window and classifies failures', () => {
    const tx = transactionIdFor(500, '1');
    const views = buildHealthViews({
      events: [
        // Outside the 14-day window — must be excluded from the trend.
        event({ transactionId: tx, sourceIssue: 500, stage: 'execution', phase: 'start', occurredAt: '2026-07-01T10:00:00.000Z' }),
        event({ transactionId: tx, sourceIssue: 500, stage: 'execution', phase: 'end', occurredAt: '2026-07-01T11:00:00.000Z' }),
        // Inside the window.
        event({ transactionId: tx, sourceIssue: 500, stage: 'review', phase: 'start', occurredAt: '2026-07-30T10:00:00.000Z' }),
        event({ transactionId: tx, sourceIssue: 500, stage: 'review', phase: 'end', occurredAt: '2026-07-30T10:30:00.000Z' }),
        event({ transactionId: tx, sourceIssue: 500, stage: 'integration', phase: 'blocked', result: 'fail', blockerClass: 'review', occurredAt: '2026-07-31T10:00:00.000Z' }),
      ],
      now: NOW,
    });
    expect(views.twoWeekTrend.transitionCount).toBe(1);
    expect(views.twoWeekTrend.p50Ms).toBe(30 * 60 * 1000);
    expect(views.twoWeekTrend.perStage.review.count).toBe(1);
    expect(views.twoWeekTrend.perStage.execution.count).toBe(0);
    expect(views.twoWeekTrend.failureCategories).toEqual({ review: 1 });
  });

  it('redacts secret-shaped strings and emails from every view', () => {
    expect(redactSensitive('token ghp_abcdefghijklmnopqrstuv123456 here')).not.toContain('ghp_');
    expect(redactSensitive('mail me at person@example.com')).not.toContain('example.com');
    expect(redactSensitive('Bearer abc.def-ghi_jkl')).not.toContain('abc.def');

    const views = buildHealthViews({
      events: [
        event({
          actor: 'leaky@example.com',
          evidence: {
            channel: 'issue_comment',
            ref: 'https://github.com/x/y/issues/1#c1',
            marker: 'ghp_abcdefghijklmnopqrstuv123456',
          },
          occurredAt: '2026-08-01T10:00:00.000Z',
        }),
      ],
      now: NOW,
    });
    const serialized = JSON.stringify(views);
    expect(serialized).not.toContain('leaky@example.com');
    expect(serialized).not.toContain('ghp_abcdefghijklmnopqrstuv123456');
  });

  it('pairs start/end per transaction+stage for durations', () => {
    const a = transactionIdFor(1, '1');
    const b = transactionIdFor(2, '1');
    const durations = computeTransitionDurations([
      event({ transactionId: a, sourceIssue: 1, stage: 'execution', phase: 'start', occurredAt: '2026-08-01T10:00:00.000Z' }),
      event({ transactionId: b, sourceIssue: 2, stage: 'execution', phase: 'start', occurredAt: '2026-08-01T10:10:00.000Z' }),
      event({ transactionId: a, sourceIssue: 1, stage: 'execution', phase: 'end', occurredAt: '2026-08-01T10:20:00.000Z' }),
    ]);
    expect(durations).toHaveLength(1);
    expect(durations[0].transactionId).toBe(a);
    expect(durations[0].durationMs).toBe(20 * 60 * 1000);
  });
});

describe('workflow-health static generator (#2888)', () => {
  it('writes health-data.json and the static renderer to the output dir', () => {
    const dir = mkdtempSync(join(tmpdir(), 'wf-health-'));
    const eventsFile = join(dir, 'events.json');
    writeFileSync(eventsFile, JSON.stringify([event({ occurredAt: '2026-08-01T10:00:00.000Z' })]));

    const { dataPath, views } = buildStaticViews({
      eventsPath: eventsFile,
      outDir: join(dir, 'out'),
      now: NOW,
    });
    expect(views.dataState).toBe('derived');
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    expect(data.schemaVersion).toBe(VIEWS_SCHEMA_VERSION);
    expect(data.eventSource).toBe(eventsFile);
    expect(existsSync(join(dir, 'out', 'index.html'))).toBe(true);
  });

  it('produces an explicit unknown empty state when no events file is provided', () => {
    const dir = mkdtempSync(join(tmpdir(), 'wf-health-empty-'));
    const { views } = buildStaticViews({ outDir: join(dir, 'out'), now: NOW });
    expect(views.dataState).toBe('no_events_unknown');
    expect(views.eventSource).toBe('none');
    expect(views.componentHealth.components.runner.status).toBe('unknown');
  });
});
