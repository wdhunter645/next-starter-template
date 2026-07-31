import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  LANE_REQUIRED,
  validateCumulativeEvidenceEvent,
} from '../../scripts/cumulative-lane-evidence/validate-event.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, '../../schemas/cumulative-lane-evidence/v1/fixtures');

function loadFixture(rel) {
  return JSON.parse(readFileSync(join(FIXTURES, rel), 'utf8'));
}

function listFixtures(subdir) {
  return readdirSync(join(FIXTURES, subdir))
    .filter((name) => name.endsWith('.json'))
    .map((name) => `${subdir}/${name}`);
}

describe('cumulative lane evidence schema (#2882)', () => {
  it('defines required fields for all four lanes', () => {
    expect(Object.keys(LANE_REQUIRED).sort()).toEqual([
      'development',
      'production',
      'promotion_candidate',
      'sandbox',
    ]);
    for (const keys of Object.values(LANE_REQUIRED)) {
      expect(keys.length).toBeGreaterThan(0);
    }
  });

  it.each(listFixtures('valid'))('accepts valid fixture %s', (rel) => {
    const event = loadFixture(rel);
    const result = validateCumulativeEvidenceEvent(event);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it.each(listFixtures('missing'))('rejects missing-field fixture %s', (rel) => {
    const event = loadFixture(rel);
    const result = validateCumulativeEvidenceEvent(event);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.startsWith('matrix:missing'))).toBe(true);
  });

  it.each(listFixtures('corrected'))('accepts correction fixture %s with supersedes', (rel) => {
    const event = loadFixture(rel);
    expect(event.transition).toBe('correct');
    expect(event.supersedes).toBeTruthy();
    const result = validateCumulativeEvidenceEvent(event);
    expect(result.ok).toBe(true);
  });

  it('rejects correct transition without supersedes', () => {
    const event = loadFixture('corrected/sandbox-exit-correction.json');
    event.supersedes = null;
    const result = validateCumulativeEvidenceEvent(event);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.startsWith('supersession:'))).toBe(true);
  });

  it.each(listFixtures('duplicate'))('rejects duplicate idempotency key in %s', (rel) => {
    const event = loadFixture(rel);
    const result = validateCumulativeEvidenceEvent(event, {
      knownIdempotencyKeys: [event.idempotencyKey],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.startsWith('duplicate:'))).toBe(true);
  });

  it.each(listFixtures('protected-stop'))(
    'fail-closes lane exit when protected stops present in %s',
    (rel) => {
      const event = loadFixture(rel);
      expect(event.protectedStops.length).toBeGreaterThan(0);
      const result = validateCumulativeEvidenceEvent(event);
      expect(result.ok).toBe(false);
      expect(result.errors.some((e) => e.startsWith('protected-stop:'))).toBe(true);
    },
  );

  it('requires candidateSha for promotion_candidate exit', () => {
    const event = loadFixture('valid/promotion-candidate-exit.json');
    event.candidateSha = null;
    event.laneFields.candidateSha = null;
    const result = validateCumulativeEvidenceEvent(event);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.startsWith('binding:candidateSha'))).toBe(true);
  });

  it('requires candidateSha for production closeout', () => {
    const event = loadFixture('valid/production-closeout.json');
    event.candidateSha = null;
    const result = validateCumulativeEvidenceEvent(event);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.startsWith('binding:candidateSha'))).toBe(true);
  });
});
