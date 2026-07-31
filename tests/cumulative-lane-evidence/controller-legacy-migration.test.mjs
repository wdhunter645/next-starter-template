import { describe, expect, it } from 'vitest';
import {
  ADMINISTRATIVE_CONTROLLER_KINDS,
  CONTROLLER_TRANSITION_KINDS,
  buildEventDraftFromControllerTransaction,
} from '../../scripts/cumulative-lane-evidence/controller-transaction-adapter.mjs';
import {
  detectLegacyEvidenceMarkers,
  mapLegacyEvidenceSurfaces,
  buildCompatibilityEventDraftFromLegacy,
} from '../../scripts/cumulative-lane-evidence/legacy-closeout-adapter.mjs';
import {
  classifyAdministrativeResidue,
  evaluateLaneExitWithAdminResidue,
} from '../../scripts/cumulative-lane-evidence/admin-residue.mjs';
import { reconcileCumulativeWorkUnit } from '../../scripts/cumulative-lane-evidence/reconcile-unit.mjs';
import { EVENT_MARKER } from '../../scripts/cumulative-lane-evidence/adapters.mjs';
import { validateCumulativeEvidenceEvent } from '../../scripts/cumulative-lane-evidence/validate-event.mjs';

describe('controller transaction adapter (#2884)', () => {
  it('knows the frozen #2677 transition kind set', () => {
    expect(CONTROLLER_TRANSITION_KINDS).toContain('closeout');
    expect(CONTROLLER_TRANSITION_KINDS).toContain('integration');
    expect(CONTROLLER_TRANSITION_KINDS).toContain('escalation');
  });

  it('maps a closeout transaction into a cumulative event draft', () => {
    const mapped = buildEventDraftFromControllerTransaction({
      kind: 'closeout',
      outcome: 'pass',
      sourceIssue: 2884,
      workUnitId: '2678-003',
      idempotencyKey: 'ctrl-closeout-2884-1',
    });
    expect(mapped.ok).toBe(true);
    expect(mapped.event.transition).toBe('closeout');
    expect(mapped.event.laneFields.controllerKind).toBe('closeout');
    expect(mapped.administrativeResidue).toBe(false);
  });

  it('rejects unknown controller kinds', () => {
    const mapped = buildEventDraftFromControllerTransaction({
      kind: 'not_a_real_kind',
      sourceIssue: 2884,
      workUnitId: '2678-003',
      idempotencyKey: 'x',
    });
    expect(mapped.ok).toBe(false);
  });

  it('marks duplicate_suppression as administrative residue', () => {
    expect(ADMINISTRATIVE_CONTROLLER_KINDS).toContain('duplicate_suppression');
    const mapped = buildEventDraftFromControllerTransaction({
      kind: 'duplicate_suppression',
      sourceIssue: 2884,
      workUnitId: '2678-003',
      idempotencyKey: 'dup-1',
    });
    expect(mapped.administrativeResidue).toBe(true);
    expect(mapped.event.result).toBe('deferred');
  });
});

describe('legacy closeout adapter (#2884)', () => {
  it('detects post-merge checklist and closeout markers', () => {
    const body = [
      '## POST-MERGE CLOSEOUT CHECKLIST',
      '',
      'CHATGPT CLOSEOUT',
      'POST-MERGE CLOSEOUT — COMPLETE',
    ].join('\n');
    const found = detectLegacyEvidenceMarkers(body);
    expect(found.map((f) => f.id).sort()).toEqual([
      'chatgpt_closeout',
      'post_merge_closeout_checklist',
      'post_merge_closeout_complete',
    ]);
  });

  it('maps legacy bodies without claiming authority or deleting history', () => {
    const mapped = mapLegacyEvidenceSurfaces({
      bodies: [{ id: 'c1', body: 'IMPLEMENTATION HANDOFF\n\nReady', createdAt: '2026-07-31T00:00:00Z' }],
    });
    expect(mapped.records).toHaveLength(1);
    expect(mapped.records[0].authoritative).toBe(false);
    expect(mapped.records[0].preservesHistory).toBe(true);
    expect(mapped.retirementClassesPresent).toContain('issue_comment_handoff');
  });

  it('builds a compatibility progress draft from a legacy marker', () => {
    const draft = buildCompatibilityEventDraftFromLegacy({
      sourceIssue: 2884,
      workUnitId: '2678-003',
      idempotencyKey: 'legacy-compat-1',
      legacyKind: 'legacy_chatgpt_closeout',
      marker: 'CHATGPT CLOSEOUT',
    });
    expect(draft.ok).toBe(true);
    expect(draft.event.transition).toBe('progress');
    expect(draft.event.result).toBe('deferred');
    const validation = validateCumulativeEvidenceEvent(draft.event, {});
    expect(validation.ok).toBe(true);
  });
});

describe('administrative residue (#2884)', () => {
  it('never blocks in-lane work', () => {
    const classified = classifyAdministrativeResidue({
      controllerKinds: ['duplicate_suppression', 'reconciliation_scan'],
      legacyRecords: [{ kind: 'legacy_chatgpt_closeout', retirementClass: 'issue_comment_closeout' }],
      unresolvedAdminNotes: ['dashboard lag'],
    });
    expect(classified.blocksInLaneWork).toBe(false);
    expect(classified.residue.length).toBeGreaterThan(0);
  });

  it('keeps in-lane work permitted even when lane exit is blocked', () => {
    const result = evaluateLaneExitWithAdminResidue({
      sourceIssue: 2884,
      workUnitId: '2678-003',
      lane: 'development',
      parsedEvents: [],
      controllerKinds: ['duplicate_suppression'],
      legacyRecords: [{ kind: 'legacy_post_merge_closeout' }],
    });
    expect(result.canExit).toBe(false);
    expect(result.inLaneWorkPermitted).toBe(true);
  });
});

describe('reconcile cumulative work unit (#2884)', () => {
  it('reconciles controller + legacy + cumulative events into one unit', () => {
    const exitEvent = {
      schemaVersion: 'lgfc-cumulative-evidence:v1',
      idempotencyKey: 'dev-exit-2884',
      sourceIssue: 2884,
      workUnitId: '2678-003',
      lane: 'development',
      transition: 'exit',
      candidateSha: null,
      actorRole: 'implementation_operations',
      actor: 'Cursor Local',
      timestamp: '2026-07-31T18:00:00.000Z',
      result: 'pass',
      evidenceRefs: [],
      supersedes: null,
      protectedStops: [],
      nextExpectedTransition: 'enter',
      summary: 'Development exit for reconcile fixture',
      laneFields: {
        sourceIssue: 2884,
        objective: 'Integrate controller and migrate legacy evidence surfaces',
        allowlist: ['scripts/cumulative-lane-evidence/**'],
        implementationSummary: 'Adapters + migration contract',
        verification: { result: 'PASS' },
        reviewDispositions: 'pending independent review',
        limitationsAndRollback: 'revert component PR',
        componentCandidate: 'component/cumulative-lane-evidence',
      },
    };

    const unit = reconcileCumulativeWorkUnit({
      sourceIssue: 2884,
      workUnitId: '2678-003',
      lane: 'development',
      comments: [
        {
          id: 1,
          createdAt: '2026-07-31T18:00:00.000Z',
          body: `${EVENT_MARKER}\n${JSON.stringify(exitEvent, null, 2)}`,
        },
      ],
      controllerTransactions: [
        { kind: 'verification', outcome: 'pass', idempotencyKey: 'ctrl-verify-1' },
        { kind: 'duplicate_suppression', idempotencyKey: 'ctrl-dup-1' },
      ],
      legacyBodies: [{ id: 'L1', body: '## POST-MERGE CLOSEOUT CHECKLIST\n- [x] done' }],
    });

    expect(unit.historyPreserved).toBe(true);
    expect(unit.reversible).toBe(true);
    expect(unit.authoritativeEventCount).toBe(1);
    expect(unit.controllerDrafts).toHaveLength(2);
    expect(unit.legacy.records).toHaveLength(1);
    expect(unit.laneExit.canExit).toBe(true);
    expect(unit.laneExit.inLaneWorkPermitted).toBe(true);
    expect(unit.administrativeResidue.blocksInLaneWork).toBe(false);
  });
});
