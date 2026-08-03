#!/usr/bin/env node
/**
 * #2897 / #2779-004 — Day-2 qualification + operator handoff check.
 *
 * Confirms predecessor proofs, Day-2 handoff report markers, measured-vs-target
 * exceptions, activation authority boundaries, exercise cadence, evidence
 * retention, and tooling disable/rollback. No Production mutation.
 *
 * Usage:
 *   node scripts/ci/platform-recovery-day2-qualify.mjs
 *   node scripts/ci/platform-recovery-day2-qualify.mjs --json
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '../..');

export const DISABLE_ENV = 'LGFC_PLATFORM_RECOVERY_DAY2_QUALIFY_DISABLED';
export const FORCE_PRODUCTION_ENVS = Object.freeze([
  'LGFC_FORCE_PRODUCTION_ROLLBACK',
  'LGFC_FORCE_PRODUCTION_OUTAGE',
  'LGFC_FORCE_PRODUCTION_DR',
  'LGFC_FORCE_PRODUCTION_RECOVERY_ACTIVATION',
]);

export const REQUIRED_PREDECESSOR_DOCS = Object.freeze([
  'docs/ops/reports/platform-recovery-readiness-inventory.md',
  'docs/ops/reports/platform-recovery-d1-b2-isolation-proof.md',
  'docs/ops/reports/platform-recovery-rollback-dr-proof.md',
  'docs/ops/reports/platform-recovery-rollback-integrated-dr-proof.md',
  'docs/reference/operations/platform-recovery-ownership.md',
]);

export const REQUIRED_DAY2_DOCS = Object.freeze([
  'docs/ops/reports/platform-recovery-day2-handoff.md',
  'docs/how-to/ops/run-platform-recovery-day2-handoff.md',
]);

export const REQUIRED_HANDOFF_MARKERS = Object.freeze([
  '## Measured vs target',
  '## Explicit exceptions',
  '## Recurring exercise cadence',
  '## Activation authority',
  '## Evidence retention',
  '## Disable and rollback',
  '## Operator handoff checklist',
  'Production recovery activation: NOT AUTHORIZED',
  'Production / main merge: NOT AUTHORIZED',
]);

export function isToolingDisabled(env = process.env) {
  return String(env[DISABLE_ENV] || '') === '1';
}

export function detectForcedProduction(env = process.env) {
  return FORCE_PRODUCTION_ENVS.filter((key) => {
    const v = String(env[key] || '').trim().toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  });
}

export function loadQualificationFixture(repoRoot = REPO_ROOT) {
  const path = join(repoRoot, 'scripts/ci/fixtures/platform-recovery-day2-qualification.json');
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  return { path, raw };
}

export function assertQualificationFixture(raw) {
  const errors = [];
  if (raw?.schema_version !== 1) errors.push('fixture_schema_version');
  if (raw?.source_issue !== '#2897') errors.push('fixture_source_issue');
  if (raw?.parent_project !== '#2779') errors.push('fixture_parent_project');
  if (raw?.production_activation_authorized !== false) {
    errors.push('fixture_production_activation_must_be_false');
  }
  if (raw?.production_merge_authorized !== false) {
    errors.push('fixture_production_merge_must_be_false');
  }
  if (!Array.isArray(raw?.predecessor_tasks) || raw.predecessor_tasks.length < 3) {
    errors.push('fixture_predecessor_tasks');
  }
  if (!Array.isArray(raw?.exceptions) || raw.exceptions.length < 1) {
    errors.push('fixture_exceptions');
  }
  if (!raw?.exercise_cadence?.synthetic || !raw?.exercise_cadence?.live_deferred) {
    errors.push('fixture_exercise_cadence');
  }
  if (!raw?.activation_authority?.day2 || !raw?.activation_authority?.product_authority) {
    errors.push('fixture_activation_authority');
  }
  if (!raw?.evidence_retention?.minimum_days) {
    errors.push('fixture_evidence_retention');
  }
  return { ok: errors.length === 0, errors };
}

export function assertDocsExist(paths, repoRoot = REPO_ROOT) {
  const missing = paths.filter((p) => !existsSync(join(repoRoot, p)));
  return { ok: missing.length === 0, missing };
}

export function assertHandoffMarkers(repoRoot = REPO_ROOT) {
  const path = join(repoRoot, 'docs/ops/reports/platform-recovery-day2-handoff.md');
  if (!existsSync(path)) {
    return { ok: false, missingMarkers: [...REQUIRED_HANDOFF_MARKERS], path };
  }
  const text = readFileSync(path, 'utf8');
  const missingMarkers = REQUIRED_HANDOFF_MARKERS.filter((m) => !text.includes(m));
  return { ok: missingMarkers.length === 0, missingMarkers, path };
}

export function runPlatformRecoveryDay2Qualify({
  repoRoot = REPO_ROOT,
  env = process.env,
} = {}) {
  const started = Date.now();
  if (isToolingDisabled(env)) {
    return {
      ok: true,
      skipped: true,
      reason: 'tooling_disabled',
      disableEnv: DISABLE_ENV,
      durationMs: Date.now() - started,
    };
  }

  const forced = detectForcedProduction(env);
  if (forced.length) {
    return {
      ok: false,
      skipped: false,
      reason: 'production_force_flag_set',
      forced,
      durationMs: Date.now() - started,
    };
  }

  const pred = assertDocsExist(REQUIRED_PREDECESSOR_DOCS, repoRoot);
  if (!pred.ok) {
    return {
      ok: false,
      reason: 'missing_predecessor_docs',
      missing: pred.missing,
      durationMs: Date.now() - started,
    };
  }

  const day2 = assertDocsExist(REQUIRED_DAY2_DOCS, repoRoot);
  if (!day2.ok) {
    return {
      ok: false,
      reason: 'missing_day2_docs',
      missing: day2.missing,
      durationMs: Date.now() - started,
    };
  }

  const markers = assertHandoffMarkers(repoRoot);
  if (!markers.ok) {
    return {
      ok: false,
      reason: 'handoff_markers_missing',
      missingMarkers: markers.missingMarkers,
      durationMs: Date.now() - started,
    };
  }

  let fixture;
  try {
    fixture = loadQualificationFixture(repoRoot);
  } catch (err) {
    return {
      ok: false,
      reason: 'fixture_unreadable',
      detail: String(err?.message || err),
      durationMs: Date.now() - started,
    };
  }

  const fixtureCheck = assertQualificationFixture(fixture.raw);
  if (!fixtureCheck.ok) {
    return {
      ok: false,
      reason: 'fixture_invalid',
      errors: fixtureCheck.errors,
      durationMs: Date.now() - started,
    };
  }

  return {
    ok: true,
    skipped: false,
    reason: 'qualified_for_day2_handoff',
    sourceIssue: '#2897',
    parentProject: '#2779',
    productionActivationAuthorized: false,
    productionMergeAuthorized: false,
    predecessorDocs: REQUIRED_PREDECESSOR_DOCS.length,
    day2Docs: REQUIRED_DAY2_DOCS.length,
    exceptions: fixture.raw.exceptions.length,
    exerciseCadence: fixture.raw.exercise_cadence,
    durationMs: Date.now() - started,
  };
}

function isMain() {
  return process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
}

if (isMain()) {
  const asJson = process.argv.includes('--json');
  const result = runPlatformRecoveryDay2Qualify();
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      result.ok
        ? `[platform-recovery-day2-qualify] PASS (${result.reason}) ${result.durationMs}ms`
        : `[platform-recovery-day2-qualify] FAIL (${result.reason})`,
    );
    if (!result.ok) console.error(JSON.stringify(result, null, 2));
  }
  process.exitCode = result.ok ? 0 : 1;
}
