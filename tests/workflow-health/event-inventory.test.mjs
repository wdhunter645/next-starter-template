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
  REQUIRED_STAGE_IDS,
  STAGE_IDS,
  STAGES,
  getAuthoritativeSources,
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
    expect(STAGE_IDS).toEqual([...REQUIRED_STAGE_IDS]);
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
    expect(summary.gapCount).toBe(6);
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

  it('rejects sources without an evidence channel', () => {
    const stages = JSON.parse(JSON.stringify(STAGES));
    delete stages[0].startEvidence[0].channel;
    const result = validateEventInventory(stages);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('malformed_source_entry:authority_ready/startEvidence');
  });

  it('rejects truncated or substituted stage sequences', () => {
    const truncated = validateEventInventory(STAGES.slice(0, 9).map((s, i) => ({ ...s, order: i + 1 })));
    expect(truncated.ok).toBe(false);
    expect(truncated.errors).toContain('stage_ids_do_not_match_required_sequence');

    const substituted = STAGES.map((s, i) =>
      i === 4 ? { ...s, id: 'not_review' } : s,
    );
    const result = validateEventInventory(substituted);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('stage_ids_do_not_match_required_sequence');
  });

  it('requires a gap explanation on local_only sources too', () => {
    const stages = JSON.parse(JSON.stringify(STAGES));
    const delivery = stages.find((s) => s.id === 'delivery');
    const packet = delivery.endEvidence.find((e) => e.evidenceClass === 'local_only');
    delete packet.notes;
    const result = validateEventInventory(stages);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('missing_gap_explanation:delivery/endEvidence/wake-packet');
  });

  it('rejects duplicate stages, bad classes/locations, empty identity fields, and non-contiguous order', () => {
    const stages = JSON.parse(JSON.stringify(STAGES));
    stages[1].id = stages[0].id;
    stages[0].startEvidence[0].evidenceClass = 'not-a-class';
    stages[0].startEvidence[1].location = 'somewhere-else';
    const deterministic = stages[1].startEvidence.find((s) => s.evidenceClass === 'deterministic');
    deterministic.identityFields = [];
    stages[2].order = 99;
    const result = validateEventInventory(stages);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain(`duplicate_stage:${stages[0].id}`);
    expect(result.errors).toContain(
      `invalid_evidence_class:${stages[0].id}/startEvidence/${stages[0].startEvidence[0].surface}`,
    );
    expect(result.errors).toContain(
      `invalid_location:${stages[0].id}/startEvidence/${stages[0].startEvidence[1].surface}`,
    );
    expect(result.errors).toContain(
      `deterministic_without_identity_fields:${stages[1].id}/startEvidence/${deterministic.surface}`,
    );
    expect(result.errors).toContain('stage_order_not_contiguous');
  });

  it('deep-freezes nested inventory data against importer mutation', () => {
    expect(() => {
      STAGES[0].startEvidence[0].evidenceClass = 'deterministic';
    }).toThrow();
    expect(STAGES[0].startEvidence[0].evidenceClass).toBe('evidence_missing');
  });
});

describe('workflow-health adapter contract (#2886)', () => {
  it('pins the envelope version and the #2680 data-contract fields', () => {
    expect(ENVELOPE_SCHEMA_VERSION).toBe('lgfc-workflow-health-event:v1');
    expect(ENVELOPE_REQUIRED_FIELDS).toEqual([
      'schemaVersion',
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
      'actorComponent',
      'result',
      'blockerClass',
      'nextExpectedAction',
      'sloDeadline',
      'idempotencyKey',
      'supersedes',
      'evidence',
      'evidenceQuality',
    ]);
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

  it('never encodes multiple alternative kinds/markers as one pipe-joined literal', () => {
    for (const stage of STAGES) {
      for (const source of [...stage.startEvidence, ...stage.endEvidence]) {
        expect(String(source.marker || ''), `${stage.id}/${source.surface}`).not.toContain('|');
      }
    }
    const result = validateEventInventory();
    expect(result.errors).toEqual([]);
  });

  it('marks the legacy closeout checklist non-authoritative so adapters cannot treat it as canonical', () => {
    const closeout = STAGES.find((s) => s.id === 'closeout');
    const legacy = closeout.startEvidence.find((s) => s.surface === 'legacy-closeout-checklist');
    const canonical = closeout.startEvidence.find((s) => s.surface === 'cumulative-evidence-event');
    expect(legacy.authoritative).toBe(false);
    expect(legacy.notes).toBeTruthy();
    expect(canonical.authoritative).not.toBe(false);

    const authoritative = getAuthoritativeSources(closeout.startEvidence);
    expect(authoritative).toHaveLength(1);
    expect(authoritative[0].surface).toBe('cumulative-evidence-event');
  });

  it('flags a non-authoritative source with no explanation', () => {
    const stages = JSON.parse(JSON.stringify(STAGES));
    const closeout = stages.find((s) => s.id === 'closeout');
    const legacy = closeout.startEvidence.find((s) => s.surface === 'legacy-closeout-checklist');
    delete legacy.notes;
    const result = validateEventInventory(stages);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('non_authoritative_without_notes:closeout/startEvidence/legacy-closeout-checklist');
  });

  it('flags a marker that encodes multiple alternatives as one literal string', () => {
    const stages = JSON.parse(JSON.stringify(STAGES));
    stages[0].startEvidence[0].marker = 'kind_a|kind_b';
    const result = validateEventInventory(stages);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.startsWith('marker_encodes_multiple_alternatives:'))).toBe(
      true,
    );
  });
});
