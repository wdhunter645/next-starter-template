#!/usr/bin/env node
/**
 * Cumulative lane evidence event validator (schema + lane matrix).
 * Work unit #2882 / parent #2678. Writer/adapters arrive in later units.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = join(
  __dirname,
  '../../schemas/cumulative-lane-evidence/v1/event.schema.json',
);

const LANE_REQUIRED = {
  sandbox: [
    'hypothesis',
    'isolationBoundary',
    'observedResult',
    'disposition',
    'carriedRisks',
  ],
  development: [
    'sourceIssue',
    'objective',
    'allowlist',
    'implementationSummary',
    'verification',
    'reviewDispositions',
    'limitationsAndRollback',
    'componentCandidate',
  ],
  promotion_candidate: [
    'candidateSha',
    'qualificationEvidence',
    'driftReconciliation',
    'unresolvedRisks',
    'productionRecommendation',
  ],
  production: [
    'approvedCandidateSha',
    'mergeOrDeployEvidence',
    'environmentChangeRecord',
    'liveVerification',
    'incidentRollbackStatus',
    'finalRisksAndFollowUps',
    'reconciliation',
  ],
};

const EXIT_TRANSITIONS = new Set(['exit', 'closeout']);
const SHA40 = /^[0-9a-f]{40}$/;

let cachedValidate;

function loadSchemaValidator() {
  if (cachedValidate) return cachedValidate;
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'));
  const ajv = new Ajv({ allErrors: true, verbose: true });
  cachedValidate = ajv.compile(schema);
  return cachedValidate;
}

/**
 * @param {unknown} event
 * @param {{ knownIdempotencyKeys?: Iterable<string> }} [options]
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateCumulativeEvidenceEvent(event, options = {}) {
  const errors = [];
  const validate = loadSchemaValidator();

  if (!validate(event)) {
    for (const err of validate.errors || []) {
      errors.push(`schema:${err.dataPath || '/'} ${err.message}`);
    }
    return { ok: false, errors };
  }

  /** @type {Record<string, any>} */
  const e = event;
  const known = new Set(options.knownIdempotencyKeys || []);

  if (known.has(e.idempotencyKey)) {
    errors.push(`duplicate:idempotencyKey ${e.idempotencyKey}`);
  }

  if (EXIT_TRANSITIONS.has(e.transition)) {
    const required = LANE_REQUIRED[e.lane] || [];
    const fields = e.laneFields || {};
    for (const key of required) {
      if (fields[key] === undefined || fields[key] === null || fields[key] === '') {
        errors.push(`matrix:missing laneFields.${key} for ${e.lane}/${e.transition}`);
      }
    }

    if (Array.isArray(e.protectedStops) && e.protectedStops.length > 0) {
      errors.push(
        `protected-stop:lane exit blocked by ${e.protectedStops.join(',')}`,
      );
    }
  }

  const needsSha =
    (e.lane === 'promotion_candidate' && EXIT_TRANSITIONS.has(e.transition)) ||
    e.lane === 'production';

  if (needsSha) {
    if (!e.candidateSha || !SHA40.test(e.candidateSha)) {
      errors.push('binding:candidateSha required (40-hex) for this lane/transition');
    }
  }

  if (
    e.lane === 'development' &&
    EXIT_TRANSITIONS.has(e.transition) &&
    e.laneFields?.sourceIssue !== undefined &&
    e.laneFields.sourceIssue !== e.sourceIssue
  ) {
    errors.push('binding:laneFields.sourceIssue must equal sourceIssue');
  }

  if (
    e.lane === 'promotion_candidate' &&
    EXIT_TRANSITIONS.has(e.transition) &&
    e.laneFields?.candidateSha &&
    e.candidateSha &&
    e.laneFields.candidateSha !== e.candidateSha
  ) {
    errors.push('binding:laneFields.candidateSha must equal candidateSha');
  }

  if (
    e.lane === 'production' &&
    e.laneFields?.approvedCandidateSha &&
    e.candidateSha &&
    e.laneFields.approvedCandidateSha !== e.candidateSha
  ) {
    errors.push('binding:laneFields.approvedCandidateSha must equal candidateSha');
  }

  if (e.transition === 'correct' && !e.supersedes) {
    errors.push('supersession:correct transition requires supersedes');
  }

  return { ok: errors.length === 0, errors };
}

export { LANE_REQUIRED, EXIT_TRANSITIONS, SCHEMA_PATH };

function main(argv) {
  const file = argv[2];
  if (!file) {
    console.error('usage: node scripts/cumulative-lane-evidence/validate-event.mjs <event.json>');
    process.exit(2);
  }
  const event = JSON.parse(readFileSync(file, 'utf8'));
  const result = validateCumulativeEvidenceEvent(event);
  if (!result.ok) {
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true }, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv);
}
