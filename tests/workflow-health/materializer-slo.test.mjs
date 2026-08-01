import { describe, expect, it } from 'vitest';
import {
  BRIDGE_MARKERS,
  adaptBridgeComments,
  adaptTaskPrOpened,
  adaptWakeWorkflowRun,
} from '../../scripts/workflow-health/adapters.mjs';
import { ingestEvents } from '../../scripts/workflow-health/ingest.mjs';
import {
  deriveComponentStatus,
  materializeAllTransactions,
  materializeTransaction,
} from '../../scripts/workflow-health/materializer.mjs';
import {
  DEFAULT_SLO_CONFIG,
  computeExecutableButIdleMs,
  evaluateSlo,
} from '../../scripts/workflow-health/slo.mjs';

const ISSUE = 2887;
const PROJECT = 2680;

function sampleFlow({ withPickupDelay = false } = {}) {
  const wake = adaptWakeWorkflowRun({
    sourceIssue: ISSUE,
    project: PROJECT,
    workUnitId: '002',
    run: { id: 100, created_at: '2026-08-01T15:00:00Z', actor: { login: 'actions' } },
  }).events;

  const bridge = adaptBridgeComments({
    sourceIssue: ISSUE,
    project: PROJECT,
    workUnitId: '002',
    comments: [
      {
        id: 1,
        created_at: '2026-08-01T15:00:30Z',
        user: { login: 'github-actions' },
        body: `${BRIDGE_MARKERS.ACK}\nDelivery id: wake-100-2887-nolabel\n`,
      },
      {
        id: 2,
        created_at: withPickupDelay
          ? '2026-08-01T15:20:00Z'
          : '2026-08-01T15:01:00Z',
        user: { login: 'bridge' },
        body: `${BRIDGE_MARKERS.STARTED}\n`,
      },
    ],
  }).events;

  const pr = adaptTaskPrOpened({
    sourceIssue: ISSUE,
    project: PROJECT,
    workUnitId: '002',
    pr: {
      number: 2991,
      created_at: '2026-08-01T15:30:00Z',
      head: { sha: 'abc123' },
      base: { ref: 'component/workflow-health-observability' },
      user: { login: 'cursor' },
    },
  }).events;

  return ingestEvents([], [...wake, ...bridge, ...pr]).events;
}

describe('workflow-health materializer (#2887)', () => {
  it('derives stage, owner, age, next action, and evidence quality', () => {
    const events = sampleFlow();
    const state = materializeTransaction({
      events,
      now: '2026-08-01T15:35:00Z',
    });

    expect(state.mutatesExecutionAuthority).toBe(false);
    expect(state.sourceIssue).toBe(ISSUE);
    expect(state.currentStage).toBe('execution');
    expect(state.currentPhase).toBe('end');
    expect(state.owner).toBe('implementation_operations');
    expect(state.evidenceQuality).toBe('deterministic');
    expect(state.nextExpectedAction?.action).toBe('begin_review');
    expect(state.pr).toBe(2991);
    expect(state.ageMs).toBe(5 * 60 * 1000);
    expect(state.workflowStatus).toBe('in_progress');
  });

  it('keeps component failures distinct from overall workflow status', () => {
    const events = sampleFlow();
    // Inject a controller blocker that must not flatten every component.
    events.push({
      schemaVersion: 'lgfc-workflow-health-event:v1',
      transactionId: events[0].transactionId,
      sourceIssue: ISSUE,
      project: PROJECT,
      lane: 'development',
      pr: 2991,
      candidateSha: null,
      stage: 'integration',
      phase: 'blocked',
      occurredAt: '2026-08-01T15:40:00Z',
      actor: 'controller',
      actorComponent: 'controller',
      result: 'blocked',
      blockerClass: 'controller',
      nextExpectedAction: { owner: 'deterministic_ci', action: 'resolve_blocker' },
      sloDeadline: null,
      idempotencyKey: 'controller-blocker-1',
      supersedes: null,
      evidence: { channel: 'workflow_artifact', ref: 'run:9', marker: 'observability.kind=blocker' },
      evidenceQuality: 'deterministic',
    });

    // Without a path through review/remediation/integration start, materializer
    // should remain at execution end — the injected blocker is a later stage.
    const state = materializeTransaction({ events, now: '2026-08-01T15:45:00Z' });
    const components = deriveComponentStatus(
      ingestEvents([], events).active,
    );
    expect(components.controller.status).toBe('degraded');
    expect(components.bridge.status).toBe('healthy');
    expect(components.cursor.status).toBe('healthy');
    expect(state.failingComponents).toContain('controller');
    expect(state.failingComponents).not.toContain('bridge');
  });

  it('never fabricates a healthy state from missing evidence', () => {
    const state = materializeTransaction({
      events: [
        {
          schemaVersion: 'lgfc-workflow-health-event:v1',
          transactionId: 'issue-2887',
          sourceIssue: ISSUE,
          project: PROJECT,
          lane: 'development',
          pr: null,
          candidateSha: null,
          stage: 'authority_ready',
          phase: 'unknown',
          occurredAt: '2026-08-01T12:00:00Z',
          actor: 'adapter',
          actorComponent: 'controller',
          result: 'unknown',
          blockerClass: 'unknown',
          nextExpectedAction: { owner: 'pmo_engineering', action: 'instrument_dispatch' },
          sloDeadline: null,
          idempotencyKey: 'gap-1',
          supersedes: null,
          evidence: { channel: 'inventory_gap', ref: 'x', marker: 'dispatch-comment' },
          evidenceQuality: 'unknown_evidence_missing',
        },
      ],
      now: '2026-08-01T12:05:00Z',
    });
    expect(state.workflowStatus).toBe('unknown');
    expect(state.evidenceQuality).toBe('unknown_evidence_missing');
  });

  it('materializes multiple transactions independently', () => {
    const a = sampleFlow();
    const b = adaptWakeWorkflowRun({
      sourceIssue: 2888,
      project: PROJECT,
      workUnitId: '003',
      run: { id: 200, created_at: '2026-08-01T16:00:00Z' },
    }).events;
    const all = materializeAllTransactions({
      events: [...a, ...b],
      now: '2026-08-01T16:05:00Z',
    });
    expect(all.length).toBe(2);
    expect(new Set(all.map((t) => t.transactionId)).size).toBe(2);
  });
});

describe('workflow-health SLO engine (#2887)', () => {
  it('defaults to informational watcher-interval pickup visibility', () => {
    expect(DEFAULT_SLO_CONFIG.watcherIntervalMinutes).toBe(5);
    expect(DEFAULT_SLO_CONFIG.stageThresholdMinutes.execution).toBe(240);
  });

  it('reports pickup visibility breach when execution starts after one interval', () => {
    const events = sampleFlow({ withPickupDelay: true });
    const slo = evaluateSlo({
      events,
      now: '2026-08-01T15:25:00Z',
      config: { watcherIntervalMinutes: 5 },
    });
    expect(slo.enforcement).toBe('informational');
    expect(slo.mutatesExecutionAuthority).toBe(false);
    expect(slo.pickupVisibleWithinInterval).toBe(false);
    expect(slo.sloBreach).toBe(true);
    expect(slo.breaches.some((b) => b.kind === 'pickup_visibility')).toBe(true);
    expect(slo.breaches[0].sourceIssue).toBe(ISSUE);
  });

  it('passes pickup visibility when STARTED arrives inside the interval', () => {
    const events = sampleFlow({ withPickupDelay: false });
    const slo = evaluateSlo({
      events,
      now: '2026-08-01T15:05:00Z',
      config: { watcherIntervalMinutes: 5 },
    });
    expect(slo.pickupVisibleWithinInterval).toBe(true);
    expect(slo.breaches.filter((b) => b.kind === 'pickup_visibility')).toHaveLength(0);
  });

  it('computes executable-but-idle time for in-progress executable stages', () => {
    // Stop before execution end: only wake + ACK + STARTED.
    const wake = adaptWakeWorkflowRun({
      sourceIssue: ISSUE,
      project: PROJECT,
      run: { id: 9, created_at: '2026-08-01T15:00:00Z' },
    }).events;
    const bridge = adaptBridgeComments({
      sourceIssue: ISSUE,
      project: PROJECT,
      comments: [
        {
          id: 1,
          created_at: '2026-08-01T15:00:30Z',
          user: { login: 'github-actions' },
          body: `${BRIDGE_MARKERS.ACK}\nDelivery id: wake-9\n`,
        },
        {
          id: 2,
          created_at: '2026-08-01T15:01:00Z',
          user: { login: 'bridge' },
          body: `${BRIDGE_MARKERS.STARTED}\n`,
        },
      ],
    }).events;
    const events = ingestEvents([], [...wake, ...bridge]).active;
    const state = materializeTransaction({ events, now: '2026-08-01T15:11:00Z' });
    expect(state.currentStage).toBe('execution');
    expect(state.currentPhase).toBe('start');
    const idle = computeExecutableButIdleMs(events, state, Date.parse('2026-08-01T15:11:00Z'));
    expect(idle).toBe(10 * 60 * 1000);

    const slo = evaluateSlo({ events, state, now: '2026-08-01T15:11:00Z' });
    expect(slo.executableButIdleMs).toBe(10 * 60 * 1000);
  });

  it('flags stage-age breaches against informational thresholds', () => {
    const events = sampleFlow({ withPickupDelay: false });
    // Freeze at execution start by dropping the PR end event.
    const withoutPr = events.filter((e) => e.idempotencyKey.indexOf('task-pr-opened') === -1);
    const slo = evaluateSlo({
      events: withoutPr,
      now: '2026-08-01T20:00:00Z',
      config: {
        watcherIntervalMinutes: 5,
        stageThresholdMinutes: { execution: 60 },
      },
    });
    expect(slo.breaches.some((b) => b.kind === 'stage_age' && b.stage === 'execution')).toBe(true);
    expect(slo.breaches.every((b) => b.informational === true)).toBe(true);
  });
});
