import { describe, expect, it } from 'vitest';
import {
  ACTOR_COMPONENTS,
  BLOCKER_CLASSES,
  CONTROLLER_TRANSITION_KINDS,
  CUMULATIVE_EVIDENCE_MARKER,
  ENVELOPE_PHASES,
  ENVELOPE_REQUIRED_FIELDS,
  ENVELOPE_SCHEMA_VERSION,
  EVIDENCE_CLASSES,
  STAGE_IDS,
  STAGES,
  summarizeInventoryGaps,
  validateEventInventory,
} from '../../scripts/workflow-health/event-inventory.mjs';

describe('workflow event inventory (#2886)', () => {
  it('covers exactly the ten #2680 required stages in order', () => {
    expect(STAGE_IDS).toEqual([
      'authority_ready',
      'delivery',
      'eligibility',
      'execution',
      'review',
      'remediation',
      'integration',
      'verification',
      'closeout',
      'continuation',
    ]);
    expect(STAGES.map((s) => s.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('validates: every stage has classified start and end evidence', () => {
    const result = validateEventInventory();
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it('never accepts label-only sources as evidence', () => {
    for (const stage of STAGES) {
      for (const source of [...stage.startEvidence, ...stage.endEvidence]) {
        expect(source.channel).not.toBe('label');
      }
    }
  });

  it('requires marker and identity fields on every deterministic source', () => {
    for (const stage of STAGES) {
      for (const source of [...stage.startEvidence, ...stage.endEvidence]) {
        if (source.evidenceClass === 'deterministic') {
          expect(source.marker, `${stage.id}/${source.surface}`).toBeTruthy();
          expect(source.identityFields.length, `${stage.id}/${source.surface}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('classifies every non-deterministic boundary as an explicit visible gap', () => {
    const summary = summarizeInventoryGaps();
    expect(summary.gapCount).toBeGreaterThan(0);
    for (const gap of summary.gaps) {
      expect(EVIDENCE_CLASSES).toContain(gap.evidenceClass);
      expect(gap.evidenceClass).not.toBe('deterministic');
      expect(gap.notes, `${gap.stage}/${gap.surface} must explain the gap`).toBeTruthy();
    }
    const gapStages = new Set(summary.gaps.map((g) => g.stage));
    // Known gaps from the inventory survey: free-form dispatch, host-local
    // packet/claim, manual pickup, correction completion, manual successor.
    expect(gapStages).toEqual(
      new Set(['authority_ready', 'delivery', 'eligibility', 'execution', 'remediation', 'continuation']),
    );
  });

  it('rejects malformed inventories', () => {
    const broken = [
      {
        id: 'authority_ready',
        order: 1,
        name: 'x',
        owner: 'x',
        definition: 'x',
        startEvidence: [
          { surface: 'a', channel: 'label', location: 'main', marker: null, identityFields: [], evidenceClass: 'deterministic' },
        ],
        endEvidence: [],
      },
    ];
    const result = validateEventInventory(broken);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('missing_endEvidence:authority_ready');
    expect(result.errors).toContain('deterministic_without_marker:authority_ready/startEvidence/a');
    expect(result.errors).toContain('label_only_source_not_permitted:authority_ready/startEvidence/a');
  });

  it('fails closed on untrusted or malformed input instead of throwing', () => {
    expect(validateEventInventory(null)).toEqual({ ok: false, errors: ['inventory_not_an_array'] });
    expect(validateEventInventory('nope').ok).toBe(false);

    const withGarbage = validateEventInventory([
      null,
      42,
      { id: '' },
      { id: 'x', order: 1, startEvidence: [null, 'str'], endEvidence: [{}] },
    ]);
    expect(withGarbage.ok).toBe(false);
    expect(withGarbage.errors.filter((e) => e === 'malformed_stage_entry')).toHaveLength(3);
    expect(withGarbage.errors).toContain('malformed_source_entry:x/startEvidence');
    expect(withGarbage.errors).toContain('malformed_source_entry:x/endEvidence');
  });
});

describe('workflow-health adapter contract (#2886)', () => {
  it('pins the envelope version and the #2680 data-contract fields', () => {
    expect(ENVELOPE_SCHEMA_VERSION).toBe('lgfc-workflow-health-event:v1');
    expect(ENVELOPE_REQUIRED_FIELDS).toEqual(
      expect.arrayContaining([
        'transactionId',
        'sourceIssue',
        'project',
        'lane',
        'pr',
        'candidateSha',
        'stage',
        'phase',
        'occurredAt',
        'actor',
        'result',
        'blockerClass',
        'nextExpectedAction',
        'sloDeadline',
        'idempotencyKey',
        'supersedes',
      ]),
    );
    expect(ENVELOPE_PHASES).toContain('unknown');
  });

  it('separately classifies authentication, capacity, review, controller, and closeout failures', () => {
    for (const cls of ['authentication', 'capacity', 'review', 'controller', 'closeout']) {
      expect(BLOCKER_CLASSES).toContain(cls);
    }
  });

  it('distinguishes runner health from other components', () => {
    expect(ACTOR_COMPONENTS).toContain('runner');
    expect(ACTOR_COMPONENTS).toContain('bridge');
    expect(ACTOR_COMPONENTS).toContain('cursor');
    expect(ACTOR_COMPONENTS).toContain('controller');
  });

  it('mirrors the #2677 observability transition kinds exactly', () => {
    expect(CONTROLLER_TRANSITION_KINDS).toEqual([
      'handoff_received',
      'evidence_complete',
      'disposition',
      'resume',
      'integration',
      'verification',
      'closeout',
      'successor_activation',
      'duplicate_suppression',
      'blocker',
      'escalation',
      'reconciliation_scan',
      'mutation_disabled',
    ]);
  });

  it('pins the #2678 cumulative evidence marker consumed at closeout', () => {
    expect(CUMULATIVE_EVIDENCE_MARKER).toBe('<!-- lgfc-cumulative-evidence:v1 -->');
  });
});
