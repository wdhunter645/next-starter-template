import { describe, expect, it } from 'vitest';
import {
  BRIDGE_MARKERS,
  CONTROLLER_KIND_MAP,
  adaptBridgeComments,
  adaptControllerSnapshots,
  adaptCumulativeEvidenceComments,
  adaptEvidenceBundle,
  adaptEvidenceMissingGaps,
  adaptPostMergeEvidence,
  adaptTaskPrOpened,
  adaptWakeWorkflowRun,
} from '../../scripts/workflow-health/adapters.mjs';
import { CONTROLLER_TRANSITION_KINDS, CUMULATIVE_EVIDENCE_MARKER } from '../../scripts/workflow-health/event-inventory.mjs';
import { validateEnvelope } from '../../scripts/workflow-health/envelope.mjs';
import { ingestEvents } from '../../scripts/workflow-health/ingest.mjs';

const ISSUE = 2887;
const PROJECT = 2680;

describe('workflow-health adapters (#2887)', () => {
  it('maps every #2677 controller kind onto a stage mapping', () => {
    for (const kind of CONTROLLER_TRANSITION_KINDS) {
      expect(CONTROLLER_KIND_MAP[kind], kind).toBeTruthy();
    }
  });

  it('normalizes Bridge ACK / FALLBACK / STARTED / COMPLETED into valid envelopes', () => {
    const { ok, events, errors } = adaptBridgeComments({
      sourceIssue: ISSUE,
      project: PROJECT,
      comments: [
        {
          id: 1,
          created_at: '2026-08-01T15:00:00Z',
          user: { login: 'github-actions' },
          body: `${BRIDGE_MARKERS.ACK}\nDelivery id: wake-1-2887-nolabel\n`,
        },
        {
          id: 2,
          created_at: '2026-08-01T15:00:05Z',
          user: { login: 'wdhunter645' },
          body: `${BRIDGE_MARKERS.FALLBACK} unclaimed — validation_failed:missing_chatgpt_response\n`,
        },
        {
          id: 3,
          created_at: '2026-08-01T15:10:00Z',
          user: { login: 'bridge' },
          body: `${BRIDGE_MARKERS.STARTED}\nissueNumber: 2887\n`,
        },
        {
          id: 4,
          created_at: '2026-08-01T15:40:00Z',
          user: { login: 'bridge' },
          body: `${BRIDGE_MARKERS.COMPLETED}\nexitCode: 0\n`,
        },
      ],
    });

    expect(errors).toEqual([]);
    expect(ok).toBe(true);
    expect(events.length).toBeGreaterThanOrEqual(4);
    for (const event of events) {
      expect(validateEnvelope(event).ok).toBe(true);
      expect(event.schemaVersion).toBe('lgfc-workflow-health-event:v1');
      expect(event.mutatesExecutionAuthority).toBeUndefined();
    }
    expect(events.some((e) => e.stage === 'delivery' && e.phase === 'end')).toBe(true);
    expect(events.some((e) => e.stage === 'eligibility' && e.result === 'fail')).toBe(true);
    expect(events.some((e) => e.stage === 'execution' && e.phase === 'start')).toBe(true);
    expect(events.some((e) => e.stage === 'execution' && e.phase === 'end' && e.result === 'pass')).toBe(
      true,
    );
  });

  it('is idempotent under replay via idempotencyKey', () => {
    const first = adaptBridgeComments({
      sourceIssue: ISSUE,
      project: PROJECT,
      comments: [
        {
          id: 10,
          created_at: '2026-08-01T15:00:00Z',
          user: { login: 'github-actions' },
          body: `${BRIDGE_MARKERS.ACK}\nDelivery id: wake-replay\n`,
        },
      ],
    });
    const second = adaptBridgeComments({
      sourceIssue: ISSUE,
      project: PROJECT,
      comments: [
        {
          id: 10,
          created_at: '2026-08-01T15:00:00Z',
          user: { login: 'github-actions' },
          body: `${BRIDGE_MARKERS.ACK}\nDelivery id: wake-replay\n`,
        },
      ],
    });
    const merged = ingestEvents(first.events, second.events);
    expect(merged.suppressedDuplicates.length).toBeGreaterThan(0);
    expect(merged.active.length).toBe(first.events.length);
  });

  it('adapts controller snapshots without inventing authority', () => {
    const { ok, events } = adaptControllerSnapshots({
      sourceIssue: ISSUE,
      project: PROJECT,
      snapshots: [
        {
          kind: 'handoff_received',
          at: '2026-08-01T14:00:00Z',
          runId: 'r1',
          source: 'controller',
        },
        {
          kind: 'blocker',
          at: '2026-08-01T16:00:00Z',
          runId: 'r2',
          source: 'controller',
        },
      ],
    });
    expect(ok).toBe(true);
    expect(events).toHaveLength(2);
    expect(events[0].stage).toBe('authority_ready');
    expect(events[1].result).toBe('blocked');
    expect(events[1].blockerClass).toBe('controller');
    expect(events.every((e) => validateEnvelope(e).ok)).toBe(true);
  });

  it('adapts post-merge results and closeout comments', () => {
    const { events } = adaptPostMergeEvidence({
      sourceIssue: ISSUE,
      project: PROJECT,
      result: {
        status: 'pass',
        pr: 2990,
        merge_sha: '3b5d5e30',
        source_issue: ISSUE,
        workflow_run_url: 'https://example.test/run/1',
        completed_at: '2026-08-01T15:50:00Z',
      },
      closeoutComments: [
        {
          id: 99,
          created_at: '2026-08-01T15:51:00Z',
          user: { login: 'github-actions' },
          body: 'Post-merge source issue closeout completed.\nPR: #2990\n',
        },
      ],
    });
    expect(events.every((e) => e.stage === 'verification')).toBe(true);
    expect(events.every((e) => validateEnvelope(e).ok)).toBe(true);
  });

  it('consumes #2678 cumulative evidence markers for closeout', () => {
    const { events, errors } = adaptCumulativeEvidenceComments({
      sourceIssue: ISSUE,
      project: PROJECT,
      comments: [
        {
          id: 7,
          created_at: '2026-08-01T16:00:00Z',
          user: { login: 'wdhunter645' },
          body: `${CUMULATIVE_EVIDENCE_MARKER}\n${JSON.stringify({
            schemaVersion: 'lgfc-cumulative-evidence:v1',
            sourceIssue: ISSUE,
            workUnitId: '2680-002',
            lane: 'development',
            transition: 'progress',
            timestamp: '2026-08-01T16:00:00Z',
            result: 'pass',
            idempotencyKey: 'cle-1',
            supersedes: null,
            candidateSha: 'abc',
          })}`,
        },
      ],
    });
    expect(errors).toEqual([]);
    expect(events).toHaveLength(1);
    expect(events[0].stage).toBe('closeout');
    expect(events[0].evidence.marker).toBe(CUMULATIVE_EVIDENCE_MARKER);
    expect(validateEnvelope(events[0]).ok).toBe(true);
  });

  it('adapts wake runs and task PR opens', () => {
    const wake = adaptWakeWorkflowRun({
      sourceIssue: ISSUE,
      project: PROJECT,
      run: { id: 555, created_at: '2026-08-01T14:55:00Z', actor: { login: 'actions' } },
    });
    expect(wake.ok).toBe(true);
    expect(wake.events.some((e) => e.stage === 'delivery' && e.phase === 'start')).toBe(true);

    const pr = adaptTaskPrOpened({
      sourceIssue: ISSUE,
      project: PROJECT,
      pr: {
        number: 2991,
        created_at: '2026-08-01T16:10:00Z',
        head: { sha: 'deadbeef' },
        base: { ref: 'component/workflow-health-observability' },
        user: { login: 'cursor' },
      },
    });
    expect(pr.ok).toBe(true);
    expect(pr.events[0].stage).toBe('execution');
    expect(pr.events[0].phase).toBe('end');
  });

  it('emits unknown events for boundaries with no deterministic authoritative source', () => {
    const { events } = adaptEvidenceMissingGaps({
      sourceIssue: ISSUE,
      project: PROJECT,
      occurredAt: '2026-08-01T12:00:00Z',
      onlyBoundariesWithoutDeterministic: true,
    });
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) {
      expect(event.phase).toBe('unknown');
      expect(event.result).toBe('unknown');
      expect(event.evidenceQuality).toBe('unknown_evidence_missing');
      expect(validateEnvelope(event).ok).toBe(true);
    }
    // Must never look healthy.
    expect(events.every((e) => e.result !== 'pass')).toBe(true);
  });

  it('keeps adapter failures distinct inside a mixed evidence bundle', () => {
    const bundle = adaptEvidenceBundle({
      sourceIssue: ISSUE,
      project: PROJECT,
      wakeRun: { id: 1, created_at: '2026-08-01T14:00:00Z' },
      comments: [
        {
          id: 1,
          created_at: '2026-08-01T14:01:00Z',
          user: { login: 'github-actions' },
          body: `${BRIDGE_MARKERS.ACK}\nDelivery id: wake-1-2887-nolabel\n`,
        },
      ],
      controllerSnapshots: [{ kind: 'not_a_real_kind', at: '2026-08-01T14:02:00Z', runId: 'x' }],
      taskPr: {
        number: 2991,
        created_at: '2026-08-01T15:00:00Z',
        head: { sha: 'abc' },
        user: { login: 'cursor' },
      },
    });

    expect(bundle.mutatesExecutionAuthority).toBe(false);
    expect(bundle.events.length).toBeGreaterThan(0);
    expect(bundle.errors.some((e) => e.startsWith('unknown_controller_kind:'))).toBe(true);
    // Bridge + wake + PR events still produced despite controller error.
    expect(bundle.events.some((e) => e.actorComponent === 'bridge')).toBe(true);
    expect(bundle.events.some((e) => e.actorComponent === 'wake_workflow')).toBe(true);
    expect(bundle.events.some((e) => e.actorComponent === 'cursor')).toBe(true);
  });

  it('rejects a post-merge result without an artifact timestamp instead of using wall-clock', () => {
    const { ok, events, errors } = adaptPostMergeEvidence({
      sourceIssue: ISSUE,
      project: PROJECT,
      result: {
        status: 'pass',
        pr: 2990,
        merge_sha: '3b5d5e30',
        source_issue: ISSUE,
      },
      closeoutComments: [
        {
          id: 100,
          created_at: '2026-08-01T15:51:00Z',
          user: { login: 'github-actions' },
          body: 'Post-merge source issue closeout completed.\nPR: #2990\n',
        },
      ],
    });
    expect(ok).toBe(false);
    expect(errors).toContain('post_merge_result_missing_timestamp');
    // Closeout comment evidence is still processed.
    expect(events).toHaveLength(1);
    expect(events[0].evidence.channel).toBe('issue_comment');
  });

  it('treats a COMPLETED comment without an exit code as unknown, never success', () => {
    const { events } = adaptBridgeComments({
      sourceIssue: ISSUE,
      project: PROJECT,
      comments: [
        {
          id: 50,
          created_at: '2026-08-01T15:40:00Z',
          user: { login: 'bridge' },
          body: `${BRIDGE_MARKERS.COMPLETED}\nno structured fields here\n`,
        },
      ],
    });
    const end = events.find((e) => e.stage === 'execution' && e.phase === 'end');
    expect(end.result).toBe('unknown');
    expect(end.blockerClass).toBe('unknown');
  });

  it('keeps distinct controller observations with the same kind/run distinct', () => {
    const { events } = adaptControllerSnapshots({
      sourceIssue: ISSUE,
      project: PROJECT,
      snapshots: [
        { kind: 'reconciliation_scan', at: '2026-08-01T14:00:00Z', runId: 'r1' },
        { kind: 'reconciliation_scan', at: '2026-08-01T15:00:00Z', runId: 'r1' },
      ],
    });
    const merged = ingestEvents([], events);
    expect(merged.active).toHaveLength(2);
  });

  it('scopes gap-event idempotency keys per transaction', () => {
    const a = adaptEvidenceMissingGaps({
      sourceIssue: 1001,
      occurredAt: '2026-08-01T12:00:00Z',
    });
    const b = adaptEvidenceMissingGaps({
      sourceIssue: 1002,
      occurredAt: '2026-08-01T12:00:00Z',
    });
    const merged = ingestEvents(a.events, b.events);
    expect(merged.suppressedDuplicates).toEqual([]);
    expect(merged.active.length).toBe(a.events.length + b.events.length);
  });

  it('applies supersession without rewriting history', () => {
    const first = adaptCumulativeEvidenceComments({
      sourceIssue: ISSUE,
      comments: [
        {
          id: 1,
          created_at: '2026-08-01T16:00:00Z',
          body: `${CUMULATIVE_EVIDENCE_MARKER}\n${JSON.stringify({
            sourceIssue: ISSUE,
            workUnitId: 'wu',
            lane: 'development',
            timestamp: '2026-08-01T16:00:00Z',
            result: 'pass',
            idempotencyKey: 'a',
          })}`,
        },
      ],
    });
    const correction = adaptCumulativeEvidenceComments({
      sourceIssue: ISSUE,
      comments: [
        {
          id: 2,
          created_at: '2026-08-01T16:05:00Z',
          body: `${CUMULATIVE_EVIDENCE_MARKER}\n${JSON.stringify({
            sourceIssue: ISSUE,
            workUnitId: 'wu',
            lane: 'development',
            timestamp: '2026-08-01T16:05:00Z',
            result: 'pass',
            idempotencyKey: 'b',
            supersedes: 'a',
          })}`,
        },
      ],
    });
    const merged = ingestEvents(first.events, correction.events);
    expect(merged.events).toHaveLength(2);
    expect(merged.supersededKeys).toContain('cumulative:a');
    expect(merged.active).toHaveLength(1);
    expect(merged.active[0].idempotencyKey).toBe('cumulative:b');
  });

  it('ignores self-referential and cyclic supersession instead of emptying the active set', () => {
    const base = {
      schemaVersion: 'lgfc-workflow-health-event:v1',
      transactionId: 'issue-2887',
      sourceIssue: ISSUE,
      project: PROJECT,
      lane: 'development',
      pr: null,
      candidateSha: null,
      stage: 'execution',
      phase: 'start',
      actor: 'x',
      actorComponent: 'cursor',
      result: 'pass',
      blockerClass: null,
      nextExpectedAction: null,
      sloDeadline: null,
      evidence: { channel: 'issue_comment', ref: 'c:1', marker: 'CURSOR BRIDGE STARTED' },
      evidenceQuality: 'deterministic',
    };
    // Self-supersession.
    const self = ingestEvents(
      [],
      [{ ...base, occurredAt: '2026-08-01T15:00:00Z', idempotencyKey: 'k1', supersedes: 'k1' }],
    );
    expect(self.active).toHaveLength(1);

    // Forward reference (would-be cycle): the earlier event names the later
    // event's key — never applied because targets must be earlier in time.
    const cycle = ingestEvents(
      [],
      [
        { ...base, occurredAt: '2026-08-01T15:00:00Z', idempotencyKey: 'k1', supersedes: 'k2' },
        { ...base, occurredAt: '2026-08-01T15:01:00Z', idempotencyKey: 'k2', supersedes: 'k1' },
      ],
    );
    expect(cycle.active).toHaveLength(1);
    expect(cycle.active[0].idempotencyKey).toBe('k2');
  });
});
