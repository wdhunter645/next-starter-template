import { describe, expect, it } from 'vitest';
import { evaluateLaneExit } from '../../scripts/cumulative-lane-evidence/lane-exit.mjs';
import { EVENT_MARKER, parseCumulativeEvidenceEvents } from '../../scripts/cumulative-lane-evidence/adapters.mjs';

function toParsed(events) {
  const comments = events.map((event, i) => ({
    id: i + 1,
    created_at: event.timestamp,
    body: `${EVENT_MARKER}\n${JSON.stringify(event)}`,
  }));
  return parseCumulativeEvidenceEvents(comments);
}

const validDevelopmentExit = {
  schemaVersion: 'lgfc-cumulative-evidence:v1',
  idempotencyKey: 'dev-exit-2883-001',
  sourceIssue: 2883,
  workUnitId: '2678-002',
  lane: 'development',
  transition: 'exit',
  actorRole: 'pr_approver_engineering',
  timestamp: '2026-07-31T10:00:00.000Z',
  result: 'pass',
  evidenceRefs: [{ kind: 'pr', uri: 'https://github.com/wdhunter645/next-starter-template/pull/1' }],
  protectedStops: [],
  laneFields: {
    sourceIssue: 2883,
    objective: 'Implement evidence writer, adapters, summary, and transition validation.',
    allowlist: ['scripts/cumulative-lane-evidence/**'],
    implementationSummary: 'Writer, adapters, summary, lane-exit evaluation.',
    verification: { commands: ['npx vitest run tests/cumulative-lane-evidence'], result: 'PASS' },
    reviewDispositions: 'Independent Engineering review required.',
    limitationsAndRollback: 'Revert the component PR.',
    componentCandidate: 'component/cumulative-lane-evidence',
  },
};

describe('cumulative lane evidence lane-exit evaluation (#2883)', () => {
  it('blocks lane exit when there is no authoritative event for that lane', () => {
    const result = evaluateLaneExit({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      lane: 'development',
      parsedEvents: [],
    });
    expect(result).toEqual({
      canExit: false,
      blockedReasons: ['no_authoritative_event_for_lane'],
      exitEvent: null,
    });
  });

  it('blocks lane exit when the latest authoritative event is not an exit/closeout transition', () => {
    const enterEvent = { ...validDevelopmentExit, idempotencyKey: 'dev-enter-2883-001', transition: 'enter', laneFields: {} };
    const result = evaluateLaneExit({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      lane: 'development',
      parsedEvents: toParsed([enterEvent]),
    });
    expect(result.canExit).toBe(false);
    expect(result.blockedReasons).toEqual(['latest_authoritative_event_is_not_exit_or_closeout']);
  });

  it('blocks lane exit when the exit event is missing required lane matrix fields', () => {
    const incomplete = { ...validDevelopmentExit, idempotencyKey: 'dev-exit-2883-002', laneFields: { sourceIssue: 2883 } };
    const result = evaluateLaneExit({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      lane: 'development',
      parsedEvents: toParsed([incomplete]),
    });
    expect(result.canExit).toBe(false);
    expect(result.blockedReasons.some((r) => r.startsWith('matrix:missing'))).toBe(true);
  });

  it('blocks lane exit while a protected stop remains active on the exit event', () => {
    const blocked = {
      ...validDevelopmentExit,
      idempotencyKey: 'dev-exit-2883-003',
      protectedStops: ['requiredGateFailure'],
    };
    const result = evaluateLaneExit({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      lane: 'development',
      parsedEvents: toParsed([blocked]),
    });
    expect(result.canExit).toBe(false);
    expect(result.blockedReasons.some((r) => r.startsWith('protected-stop:'))).toBe(true);
  });

  it('allows lane exit once a complete, unblocked exit event is authoritative', () => {
    const result = evaluateLaneExit({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      lane: 'development',
      parsedEvents: toParsed([validDevelopmentExit]),
    });
    expect(result.canExit).toBe(true);
    expect(result.blockedReasons).toEqual([]);
    expect(result.exitEvent.idempotencyKey).toBe(validDevelopmentExit.idempotencyKey);
  });

  it('re-evaluates a corrected exit event on its own merits, not the event it superseded', () => {
    const correction = {
      ...validDevelopmentExit,
      idempotencyKey: 'dev-exit-2883-004',
      transition: 'exit',
      supersedes: validDevelopmentExit.idempotencyKey,
      laneFields: { sourceIssue: 2883 },
    };
    const result = evaluateLaneExit({
      sourceIssue: 2883,
      workUnitId: '2678-002',
      lane: 'development',
      parsedEvents: toParsed([validDevelopmentExit, correction]),
    });
    // The correction superseded the valid exit and is itself incomplete, so
    // it becomes the authoritative event and exit must fail closed again.
    expect(result.canExit).toBe(false);
    expect(result.blockedReasons.some((r) => r.startsWith('matrix:missing'))).toBe(true);
  });
});
