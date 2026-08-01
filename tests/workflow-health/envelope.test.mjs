import { describe, expect, it } from 'vitest';
import {
  ENVELOPE_LANES,
  buildEnvelope,
  validateEnvelope,
} from '../../scripts/workflow-health/envelope.mjs';

const valid = Object.freeze({
  schemaVersion: 'lgfc-workflow-health-event:v1',
  transactionId: 'issue-2887',
  sourceIssue: 2887,
  project: 2680,
  lane: 'development',
  pr: null,
  candidateSha: null,
  stage: 'execution',
  phase: 'start',
  occurredAt: '2026-08-01T15:00:00Z',
  actor: 'bridge',
  actorComponent: 'bridge',
  result: 'pass',
  blockerClass: null,
  nextExpectedAction: null,
  sloDeadline: null,
  idempotencyKey: 'k1',
  supersedes: null,
  evidence: { channel: 'issue_comment', ref: 'c:1', marker: 'CURSOR BRIDGE STARTED' },
  evidenceQuality: 'deterministic',
});

describe('workflow-health envelope validation (#2887)', () => {
  it('accepts a fully valid envelope', () => {
    expect(validateEnvelope({ ...valid })).toEqual({ ok: true, errors: [] });
  });

  it('pins the four contract lanes and rejects arbitrary lane values', () => {
    expect(ENVELOPE_LANES).toEqual([
      'sandbox',
      'development',
      'promotion_candidate',
      'production',
    ]);
    const result = validateEnvelope({ ...valid, lane: 'staging' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('invalid_lane:staging');
  });

  it('requires ISO 8601 UTC timestamps for occurredAt', () => {
    for (const bad of ['2026-08-01T15:00:00', '2026-08-01T15:00:00-04:00', 'yesterday']) {
      const result = validateEnvelope({ ...valid, occurredAt: bad });
      expect(result.ok, bad).toBe(false);
      expect(result.errors).toContain('invalid_occurredAt');
    }
    expect(validateEnvelope({ ...valid, occurredAt: '2026-08-01T15:00:00+00:00' }).ok).toBe(true);
  });

  it('rejects malformed non-null sloDeadline values', () => {
    const result = validateEnvelope({ ...valid, sloDeadline: 'soon' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('invalid_sloDeadline');
    expect(validateEnvelope({ ...valid, sloDeadline: '2026-08-01T16:00:00Z' }).ok).toBe(true);
    expect(validateEnvelope({ ...valid, sloDeadline: null }).ok).toBe(true);
  });

  it('buildEnvelope fails closed on the same rules', () => {
    const built = buildEnvelope({
      transactionId: 'issue-1',
      sourceIssue: 1,
      lane: 'nope',
      stage: 'execution',
      phase: 'start',
      occurredAt: '2026-08-01T15:00:00-04:00',
      actor: 'x',
      actorComponent: 'cursor',
      result: 'pass',
      idempotencyKey: 'k',
      evidence: { channel: 'issue_comment', ref: 'c:1', marker: 'm' },
      evidenceQuality: 'deterministic',
    });
    expect(built.ok).toBe(false);
    expect(built.event).toBe(null);
    expect(built.errors).toContain('invalid_lane:nope');
    expect(built.errors).toContain('invalid_occurredAt');
  });
});
