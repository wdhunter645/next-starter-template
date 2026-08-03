#!/usr/bin/env node
/**
 * #2896 / #2779-003 — source/config/deployment rollback + integrated DR.
 *
 * Proves immutable candidate identity, repository/configuration reconstruction,
 * synthetic deployment rollback decision path, failure/stop conditions,
 * nested D1/B2 isolation evidence, communications/monitoring records, and
 * return-to-service verification — synthetic/redacted only.
 *
 * Never mutates Production, live Cloudflare Pages, live D1, live B2, or DNS.
 * Never logs or embeds secret values.
 *
 * Usage:
 *   node scripts/ci/platform-recovery-rollback-integrated-dr.mjs
 *   node scripts/ci/platform-recovery-rollback-integrated-dr.mjs --json
 */
import { createHash, randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runPlatformRecoveryD1B2Isolation } from './platform-recovery-d1-b2-isolation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '../..');

const DISABLE_ENV = 'LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED';
const FORCE_PRODUCTION_ROLLBACK = 'LGFC_FORCE_PRODUCTION_ROLLBACK';
const FORCE_PRODUCTION_OUTAGE = 'LGFC_FORCE_PRODUCTION_OUTAGE';
const FORCE_PRODUCTION_DR = 'LGFC_FORCE_PRODUCTION_DR';

export const PROTECTED_FORCE_FLAGS = Object.freeze([
  FORCE_PRODUCTION_ROLLBACK,
  FORCE_PRODUCTION_OUTAGE,
  FORCE_PRODUCTION_DR,
]);

export const FIXTURE_CANDIDATE =
  'scripts/ci/fixtures/platform-recovery-immutable-candidate.json';
export const FIXTURE_DR_SCENARIO = 'scripts/ci/fixtures/platform-recovery-dr-scenario.json';
export const EVIDENCE_DOC =
  'docs/ops/reports/platform-recovery-rollback-integrated-dr-proof.md';
export const HOWTO_DOC =
  'docs/how-to/ops/run-platform-recovery-rollback-integrated-dr.md';

/** Paths that must be reconstructible from Git for source/config recovery. */
export const RECONSTRUCT_PATHS = Object.freeze([
  'Agent.md',
  'package.json',
  'wrangler.toml',
  'functions',
  '.github/workflows',
  'migrations',
  'docs/governance/OPERATIONS-AND-RECOVERY.md',
  'docs/how-to/website/website-production-rollback.md',
  'docs/how-to/ops/run-emergency-recovery.md',
  'docs/reference/delivery/delivery-and-rollback-profiles.md',
  'docs/ops/reports/platform-recovery-d1-b2-isolation-proof.md',
  'scripts/ci/platform-recovery-d1-b2-isolation.mjs',
]);

/** Heuristic forbidden tokens for evidence secret scanning (names/patterns only). */
export const FORBIDDEN_EVIDENCE_TOKENS = Object.freeze([
  'api_token=',
  'app_key=',
  'password=',
  'secret_value=',
  'bearer ',
  '-----begin',
]);

export const TARGETS = Object.freeze({
  sourceConfigRto: '4 hours',
  deploymentRto: '2 hours',
});

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function gitSha() {
  const r = spawnSync('git', ['-C', REPO_ROOT, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
  });
  return r.status === 0 ? r.stdout.trim() : null;
}

function readText(rel) {
  const abs = join(REPO_ROOT, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

function sha256Text(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function envTruthy(env, key) {
  const raw = String(env[key] || '')
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export function isToolingDisabled(env = process.env) {
  return envTruthy(env, DISABLE_ENV);
}

export function isSha40(value) {
  return typeof value === 'string' && /^[a-f0-9]{40}$/i.test(value);
}

export function isDeploymentId(value) {
  return typeof value === 'string' && value.trim().length >= 4;
}

/** Strip TOML full-line and trailing comments for active-assignment parsing. */
export function stripTomlComments(text) {
  return String(text || '')
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return '';
      // Preserve quoted strings while removing trailing comments.
      let inQuotes = false;
      let out = '';
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"' && line[i - 1] !== '\\') inQuotes = !inQuotes;
        if (ch === '#' && !inQuotes) break;
        out += ch;
      }
      return out;
    })
    .join('\n');
}

export function parseWranglerConfig(text) {
  const active = stripTomlComments(text);
  const bindingMatch = active.match(/binding\s*=\s*"([^"]+)"/);
  const nameMatch = active.match(/database_name\s*=\s*"([^"]+)"/);
  const idMatch = active.match(/database_id\s*=\s*"([^"]+)"/);
  const outMatch = active.match(/pages_build_output_dir\s*=\s*"([^"]+)"/);
  return {
    binding: bindingMatch?.[1] || null,
    databaseName: nameMatch?.[1] || null,
    databaseId: idMatch?.[1] || null,
    pagesBuildOutputDir: outMatch?.[1] || null,
    ok:
      bindingMatch?.[1] === 'DB' &&
      nameMatch?.[1] === 'lgfc_lite' &&
      Boolean(idMatch?.[1]) &&
      Boolean(outMatch?.[1]),
  };
}

/**
 * Select rollback target from immutable candidate fixture.
 * Prefer lastKnownGood when current candidate is marked failed.
 */
export function selectRollbackTarget(candidate) {
  const failed = candidate?.currentFailedCandidate;
  const good = candidate?.lastKnownGoodCandidate;
  if (!failed || !good) {
    return {
      ok: false,
      reason: 'missing_failed_or_good_candidate',
      target: null,
    };
  }
  if (!isSha40(good.gitSha) || !isDeploymentId(good.deploymentId)) {
    return {
      ok: false,
      reason: 'invalid_last_known_good_identity',
      target: null,
    };
  }
  if (!isSha40(failed.gitSha) || !isDeploymentId(failed.deploymentId)) {
    return {
      ok: false,
      reason: 'invalid_failed_candidate_identity',
      target: null,
    };
  }
  if (failed.gitSha === good.gitSha || failed.deploymentId === good.deploymentId) {
    return {
      ok: false,
      reason: 'failed_and_good_identities_not_distinct',
      target: null,
    };
  }
  return {
    ok: true,
    reason: 'rollback_to_last_known_good',
    target: {
      gitSha: good.gitSha,
      deploymentId: good.deploymentId,
      pagesProject: good.pagesProject,
      fromFailedGitSha: failed.gitSha,
      fromFailedDeploymentId: failed.deploymentId,
      synthetic: true,
      productionMutation: false,
    },
  };
}

export function scanEvidenceForSecrets(texts = []) {
  const joined = texts.filter((t) => typeof t === 'string').join('\n').toLowerCase();
  const leaked = FORBIDDEN_EVIDENCE_TOKENS.filter((tok) => joined.includes(tok));
  return { ok: leaked.length === 0, leaked };
}

/**
 * Ensure scenario declares and aligns with protected force-flag stop matrix.
 */
export function validateScenarioGuards(scenario) {
  const checks = [];
  checks.push({
    name: 'scenario_production_mutation_false',
    ok: scenario?.productionMutation === false,
    detail: `productionMutation=${scenario?.productionMutation}`,
  });
  checks.push({
    name: 'scenario_authority_forbids_mutation',
    ok: scenario?.authority?.productionMutationAuthorized === false,
    detail: `productionMutationAuthorized=${scenario?.authority?.productionMutationAuthorized}`,
  });
  checks.push({
    name: 'scenario_authority_forbids_outage',
    ok: scenario?.authority?.outageSimulationAuthorized === false,
    detail: `outageSimulationAuthorized=${scenario?.authority?.outageSimulationAuthorized}`,
  });

  const stopIfAll = (scenario?.phases || []).flatMap((p) => p.stopIf || []);
  for (const flag of PROTECTED_FORCE_FLAGS) {
    checks.push({
      name: `scenario_stopIf_declares:${flag}`,
      ok: stopIfAll.includes(flag),
      detail: stopIfAll.includes(flag) ? 'declared in phase stopIf' : 'missing from scenario stopIf matrix',
    });
  }
  return {
    ok: checks.every((c) => c.ok),
    checks,
  };
}

export function proveSourceConfigReconstruction(repoRoot = REPO_ROOT) {
  const started = performance.now();
  const pathResults = [];
  for (const rel of RECONSTRUCT_PATHS) {
    const abs = join(repoRoot, rel);
    pathResults.push({
      path: rel,
      ok: existsSync(abs),
    });
  }
  const wranglerText = existsSync(join(repoRoot, 'wrangler.toml'))
    ? readFileSync(join(repoRoot, 'wrangler.toml'), 'utf8')
    : null;
  const wrangler = parseWranglerConfig(wranglerText || '');
  const fingerprintParts = [];
  for (const p of pathResults.filter((x) => x.ok)) {
    const abs = join(repoRoot, p.path);
    // Directories contribute a stable sorted listing; files contribute content.
    try {
      const st = readdirSync(abs, { withFileTypes: true });
      const listing = st
        .map((e) => `${e.isDirectory() ? 'd' : 'f'}:${e.name}`)
        .sort()
        .join('|');
      fingerprintParts.push(`${p.path}\n${listing}`);
    } catch {
      fingerprintParts.push(`${p.path}\n${readFileSync(abs, 'utf8')}`);
    }
  }
  const configFingerprint = sha256Text(fingerprintParts.join('\n---\n'));
  const workflowsDir = join(repoRoot, '.github/workflows');
  let workflowCount = 0;
  if (existsSync(workflowsDir)) {
    workflowCount = readdirSync(workflowsDir).filter((f) =>
      f.endsWith('.yml') || f.endsWith('.yaml'),
    ).length;
  }
  const functionsDir = join(repoRoot, 'functions');
  const functionsPresent = existsSync(functionsDir);
  const migrationsDir = join(repoRoot, 'migrations');
  let migrationCount = 0;
  if (existsSync(migrationsDir)) {
    migrationCount = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).length;
  }

  const missing = pathResults.filter((p) => !p.ok).map((p) => p.path);
  return {
    ok: missing.length === 0 && wrangler.ok && workflowCount > 0 && functionsPresent && migrationCount > 0,
    missing,
    wrangler,
    configFingerprint,
    workflowCount,
    functionsPresent,
    migrationCount,
    durationMs: Math.round(performance.now() - started),
  };
}

export function buildSyntheticCommunicationsRecord({
  scenarioId,
  candidateSha,
  deploymentId,
  phaseResults,
}) {
  const body = [
    `SYNTHETIC DR COMMUNICATIONS RECORD`,
    `scenarioId=${scenarioId}`,
    `candidateSha=${candidateSha}`,
    `deploymentId=${deploymentId}`,
    `productionMutation=false`,
    `synthetic=true`,
    `phases=${(phaseResults || []).map((p) => `${p.id}:${p.ok ? 'ok' : 'FAIL'}`).join(',')}`,
  ].join('\n');
  const forbidden = ['api_token', 'app_key', 'password', 'secret_value'];
  const lower = body.toLowerCase();
  const leaked = forbidden.filter((f) => lower.includes(f));
  return {
    ok: leaked.length === 0 && body.includes('productionMutation=false'),
    body,
    leaked,
    sha256: sha256Text(body),
  };
}

export function runReturnToServiceChecks({ candidate, reconstruct, rollback, evidenceTexts = [] }) {
  const checks = [];
  const rts = Array.isArray(candidate?.returnToServiceChecks)
    ? candidate.returnToServiceChecks
    : [];

  checks.push({
    id: 'home_route_smoke',
    ok: reconstruct?.ok === true,
    detail: 'synthetic: reconstructible source tree stands in for home/static smoke',
  });
  checks.push({
    id: 'health_or_static_export_present',
    ok: reconstruct?.wrangler?.pagesBuildOutputDir === './out',
    detail: `pages_build_output_dir=${reconstruct?.wrangler?.pagesBuildOutputDir || '(missing)'}`,
  });
  checks.push({
    id: 'wrangler_binding_names_intact',
    ok:
      reconstruct?.wrangler?.binding === 'DB' &&
      reconstruct?.wrangler?.databaseName === 'lgfc_lite',
    detail: `binding=${reconstruct?.wrangler?.binding}; database=${reconstruct?.wrangler?.databaseName}`,
  });
  const secretScan = scanEvidenceForSecrets(evidenceTexts);
  checks.push({
    id: 'no_secret_values_in_evidence',
    ok: secretScan.ok,
    detail: secretScan.ok
      ? `scanned ${evidenceTexts.length} evidence blob(s); no forbidden tokens`
      : `leaked=${secretScan.leaked.join(',')}`,
  });
  checks.push({
    id: 'rollback_target_identity',
    ok: rollback?.ok === true && isSha40(rollback?.target?.gitSha),
    detail: rollback?.ok
      ? `target=${rollback.target.gitSha.slice(0, 12)}… deploy=${rollback.target.deploymentId}`
      : rollback?.reason || 'rollback_failed',
  });

  const requiredOk = rts.every((id) => checks.some((c) => c.id === id && c.ok));
  return {
    ok: requiredOk && checks.every((c) => c.ok),
    checks,
    requiredIds: rts,
  };
}

function protectedStopChecks(env) {
  const checks = [];
  for (const key of PROTECTED_FORCE_FLAGS) {
    const forced = envTruthy(env, key);
    checks.push({
      name: `protected_stop:${key}`,
      ok: !forced,
      detail: forced
        ? `${key} set — refuse Production mutation/outage (fail closed)`
        : `${key} unset`,
      severity: 'blocker',
    });
  }
  return checks;
}

export function runPlatformRecoveryRollbackIntegratedDr(opts = {}) {
  const env = opts.env || process.env;
  const now = new Date().toISOString();
  const actorRole = opts.actorRole || 'Implementation / Operations';
  const workRoot =
    opts.workRoot ||
    join(REPO_ROOT, '.tmp', `platform-recovery-rollback-dr-${randomUUID()}`);
  const includeNestedIsolation = opts.includeNestedIsolation !== false;

  if (isToolingDisabled(env)) {
    return {
      ok: true,
      disabled: true,
      disableEnv: DISABLE_ENV,
      productionMutation: false,
      writeAttempts: 0,
      observedAt: now,
      actorRole,
      sourceIssue: '#2896',
      parentProject: '#2779',
      checks: [
        {
          name: 'tooling_disabled',
          ok: true,
          detail: `${DISABLE_ENV} set; rollback/DR proof skipped`,
          severity: 'info',
        },
      ],
      summary: {
        recommendation: 'SKIPPED_DISABLED',
        productionMutation: 'not_authorized',
      },
    };
  }

  const checks = [];
  let writeAttempts = 0;
  let cleanupOk = false;
  let candidate = null;
  let scenario = null;
  let reconstruct = null;
  let rollback = null;
  let nestedIsolation = null;
  let communications = null;
  let returnToService = null;
  const phaseResults = [];
  const measured = {
    reconstructMs: null,
    nestedIsolationMs: null,
    totalMs: null,
  };
  const totalStart = performance.now();

  // Protected stops evaluated first (fail closed).
  for (const c of protectedStopChecks(env)) {
    checks.push(c);
  }

  const forceBlocked = checks.some((c) => c.name.startsWith('protected_stop:') && !c.ok);
  if (forceBlocked) {
    measured.totalMs = Math.round(performance.now() - totalStart);
    return {
      ok: false,
      disabled: false,
      productionMutation: false,
      writeAttempts: 0,
      observedAt: now,
      actorRole,
      sourceIssue: '#2896',
      parentProject: '#2779',
      componentBranch: 'component/platform-recovery-readiness',
      headSha: gitSha(),
      measured,
      targets: TARGETS,
      limitations: [
        'Protected Production force flag set — exercise refused without mutation.',
      ],
      cleanupOk: true,
      checks,
      summary: {
        blockerFailures: checks.filter((c) => !c.ok).map((c) => c.name),
        recommendation: 'ROLLBACK_INTEGRATED_DR_BLOCKED_PROTECTED_STOP',
        productionMutation: 'not_authorized',
      },
    };
  }

  try {
    mkdirSync(workRoot, { recursive: true });
    writeAttempts += 1;

    const candidateRaw = readText(FIXTURE_CANDIDATE);
    try {
      candidate = candidateRaw ? JSON.parse(candidateRaw) : null;
    } catch {
      candidate = null;
    }
    checks.push({
      name: 'immutable_candidate_fixture_present',
      ok: Boolean(candidate?.synthetic && candidate?.lastKnownGoodCandidate),
      detail: FIXTURE_CANDIDATE,
      severity: 'blocker',
    });

    const scenarioRaw = readText(FIXTURE_DR_SCENARIO);
    try {
      scenario = scenarioRaw ? JSON.parse(scenarioRaw) : null;
    } catch {
      scenario = null;
    }
    checks.push({
      name: 'dr_scenario_fixture_present',
      ok: Boolean(scenario?.synthetic && Array.isArray(scenario?.phases)),
      detail: FIXTURE_DR_SCENARIO,
      severity: 'blocker',
    });

    if (scenario) {
      const guard = validateScenarioGuards(scenario);
      for (const c of guard.checks) {
        checks.push({
          name: c.name,
          ok: c.ok,
          detail: c.detail,
          severity: 'blocker',
        });
      }
    }

    checks.push({
      name: 'evidence_doc_present',
      ok: existsSync(join(REPO_ROOT, EVIDENCE_DOC)),
      detail: EVIDENCE_DOC,
      severity: 'blocker',
    });
    checks.push({
      name: 'howto_doc_present',
      ok: existsSync(join(REPO_ROOT, HOWTO_DOC)),
      detail: HOWTO_DOC,
      severity: 'blocker',
    });

    // Phase: detect
    phaseResults.push({
      id: 'detect',
      ok: Boolean(scenario?.scenarioId) && scenario?.authority?.productionMutationAuthorized === false,
      detail: `scenarioId=${scenario?.scenarioId || '(missing)'}`,
    });

    // Phase: decide + rollback target selection
    rollback = candidate ? selectRollbackTarget(candidate) : { ok: false, reason: 'no_candidate' };
    phaseResults.push({
      id: 'decide',
      ok: rollback.ok,
      detail: rollback.ok ? rollback.reason : rollback.reason,
    });
    checks.push({
      name: 'immutable_candidate_identity',
      ok: rollback.ok && isSha40(rollback.target?.gitSha),
      detail: rollback.ok
        ? `good=${rollback.target.gitSha}; deploy=${rollback.target.deploymentId}`
        : rollback.reason,
      severity: 'blocker',
    });
    checks.push({
      name: 'rollback_decision_path',
      ok: rollback.ok && rollback.target?.productionMutation === false,
      detail: rollback.ok
        ? `from=${rollback.target.fromFailedDeploymentId} -> ${rollback.target.deploymentId}`
        : rollback.reason,
      severity: 'blocker',
    });

    // Phase: reconstruct source/config
    reconstruct = proveSourceConfigReconstruction(REPO_ROOT);
    measured.reconstructMs = reconstruct.durationMs;
    phaseResults.push({
      id: 'reconstruct_source_config',
      ok: reconstruct.ok,
      detail: reconstruct.ok
        ? `fingerprint=${reconstruct.configFingerprint.slice(0, 12)}… workflows=${reconstruct.workflowCount}`
        : `missing=${reconstruct.missing.join(',')}`,
    });
    checks.push({
      name: 'source_config_reconstruction',
      ok: reconstruct.ok,
      detail: phaseResults.at(-1).detail,
      severity: 'blocker',
    });
    checks.push({
      name: 'wrangler_offline_parse',
      ok: reconstruct.wrangler.ok,
      detail: `binding=${reconstruct.wrangler.binding}; db=${reconstruct.wrangler.databaseName}; out=${reconstruct.wrangler.pagesBuildOutputDir}`,
      severity: 'blocker',
    });

    // Phase: rollback_deployment (synthetic record only)
    const rollbackRecordPath = join(workRoot, 'synthetic-rollback-record.json');
    if (rollback.ok) {
      writeFileSync(
        rollbackRecordPath,
        JSON.stringify(
          {
            ...rollback.target,
            recordedAt: now,
            procedureRefs: candidate.rollbackProcedureRefs,
          },
          null,
          2,
        ),
      );
      writeAttempts += 1;
    }
    phaseResults.push({
      id: 'rollback_deployment',
      ok: rollback.ok && existsSync(rollbackRecordPath),
      detail: rollback.ok
        ? 'synthetic rollback record written; Cloudflare APIs not called'
        : 'skipped — no valid target',
    });
    checks.push({
      name: 'synthetic_rollback_record',
      ok: phaseResults.at(-1).ok,
      detail: phaseResults.at(-1).detail,
      severity: 'blocker',
    });

    // Phase: nested D1/B2 isolation (#2895) — required for integrated proof
    if (includeNestedIsolation) {
      const isoStart = performance.now();
      nestedIsolation = runPlatformRecoveryD1B2Isolation({
        actorRole: 'nested-from-#2896',
        env,
      });
      measured.nestedIsolationMs = Math.round(performance.now() - isoStart);
    } else {
      nestedIsolation = {
        ok: false,
        skipped: true,
        productionMutation: false,
        summary: { recommendation: 'NESTED_ISOLATION_REQUIRED' },
      };
      measured.nestedIsolationMs = 0;
    }
    phaseResults.push({
      id: 'data_media_isolation',
      ok:
        nestedIsolation?.ok === true &&
        nestedIsolation?.productionMutation === false &&
        !nestedIsolation?.skipped,
      detail: nestedIsolation?.disabled
        ? 'nested isolation disabled via env'
        : nestedIsolation?.skipped
          ? 'FAIL: nested isolation required for integrated DR proof'
          : `nested_ok=${nestedIsolation?.ok}; recommendation=${nestedIsolation?.summary?.recommendation || 'n/a'}`,
    });
    checks.push({
      name: 'nested_d1_b2_isolation',
      ok: phaseResults.at(-1).ok,
      detail: phaseResults.at(-1).detail,
      severity: 'blocker',
    });

    // Phase: communications
    communications = buildSyntheticCommunicationsRecord({
      scenarioId: scenario?.scenarioId || 'UNKNOWN',
      candidateSha: rollback?.target?.gitSha || 'none',
      deploymentId: rollback?.target?.deploymentId || 'none',
      phaseResults,
    });
    writeFileSync(join(workRoot, 'synthetic-comms.txt'), communications.body);
    writeAttempts += 1;
    phaseResults.push({
      id: 'communications',
      ok: communications.ok,
      detail: communications.ok
        ? `sha256=${communications.sha256.slice(0, 12)}…`
        : `leaked=${communications.leaked.join(',')}`,
    });
    checks.push({
      name: 'communications_record',
      ok: communications.ok,
      detail: phaseResults.at(-1).detail,
      severity: 'blocker',
    });

    // Phase: monitoring
    const monitoringOk =
      Array.isArray(scenario?.monitoring?.successCriteria) &&
      scenario.monitoring.successCriteria.length > 0;
    phaseResults.push({
      id: 'monitoring',
      ok: monitoringOk,
      detail: monitoringOk
        ? `window=${scenario.monitoring.observationWindow}; criteria=${scenario.monitoring.successCriteria.length}`
        : 'monitoring block missing',
    });
    checks.push({
      name: 'monitoring_plan_present',
      ok: monitoringOk,
      detail: phaseResults.at(-1).detail,
      severity: 'blocker',
    });

    // Phase: return-to-service
    const evidenceTexts = [
      candidateRaw || '',
      scenarioRaw || '',
      communications?.body || '',
      rollback.ok ? JSON.stringify(rollback.target) : '',
      readText(EVIDENCE_DOC) || '',
      readText(HOWTO_DOC) || '',
    ];
    returnToService = runReturnToServiceChecks({
      candidate,
      reconstruct,
      rollback,
      evidenceTexts,
    });
    phaseResults.push({
      id: 'return_to_service',
      ok: returnToService.ok,
      detail: returnToService.ok
        ? `checks=${returnToService.checks.length}`
        : `failed=${returnToService.checks.filter((c) => !c.ok).map((c) => c.id).join(',')}`,
    });
    checks.push({
      name: 'return_to_service_verification',
      ok: returnToService.ok,
      detail: phaseResults.at(-1).detail,
      severity: 'blocker',
    });

    // Scenario phase completeness
    const expectedPhaseIds = (scenario?.phases || []).map((p) => p.id);
    const actualPhaseIds = phaseResults.map((p) => p.id);
    const missingPhases = expectedPhaseIds.filter((id) => !actualPhaseIds.includes(id));
    checks.push({
      name: 'integrated_dr_phases_complete',
      ok: missingPhases.length === 0 && phaseResults.every((p) => p.ok),
      detail:
        missingPhases.length === 0
          ? `phases=${actualPhaseIds.join(',')}`
          : `missing=${missingPhases.join(',')}`,
      severity: 'blocker',
    });

    // Targets comparison (exercise durations vs RTO upper bounds — not Production RTO proof)
    measured.totalMs = Math.round(performance.now() - totalStart);
    checks.push({
      name: 'measured_reconstruct_within_rto_target_bound',
      ok: measured.reconstructMs != null && measured.reconstructMs < 4 * 60 * 60 * 1000,
      detail: `reconstructMs=${measured.reconstructMs}; targetRto=${TARGETS.sourceConfigRto} (isolated exercise, not Production)`,
      severity: 'info',
    });
    checks.push({
      name: 'measured_total_within_deployment_rto_target_bound',
      ok: measured.totalMs != null && measured.totalMs < 2 * 60 * 60 * 1000,
      detail: `totalMs=${measured.totalMs}; targetRto=${TARGETS.deploymentRto} (isolated exercise, not Production)`,
      severity: 'info',
    });

    checks.push({
      name: 'no_production_mutation',
      ok: true,
      detail: 'synthetic fixtures + local temp records only; live CF/D1/B2/DNS untouched',
      severity: 'info',
    });
    checks.push({
      name: 'no_production_outage_induced',
      ok: scenario?.authority?.outageSimulationAuthorized === false,
      detail: 'scenario forbids outage simulation; no traffic or DNS changes',
      severity: 'blocker',
    });
  } finally {
    try {
      if (existsSync(workRoot)) {
        rmSync(workRoot, { recursive: true, force: true });
        cleanupOk = !existsSync(workRoot);
      } else {
        cleanupOk = true;
      }
    } catch {
      cleanupOk = false;
    }
    checks.push({
      name: 'isolated_workdir_cleanup',
      ok: cleanupOk,
      detail: cleanupOk ? `removed ${workRoot}` : `cleanup_failed ${workRoot}`,
      severity: 'blocker',
    });
  }

  const blockers = checks.filter((c) => c.severity === 'blocker' && !c.ok);
  const ok = blockers.length === 0;
  measured.totalMs = measured.totalMs ?? Math.round(performance.now() - totalStart);

  return {
    ok,
    disabled: false,
    productionMutation: false,
    writeAttempts,
    observedAt: now,
    actorRole,
    sourceIssue: '#2896',
    parentProject: '#2779',
    componentBranch: 'component/platform-recovery-readiness',
    headSha: gitSha(),
    measured,
    targets: TARGETS,
    candidate: rollback?.target
      ? {
          gitSha: rollback.target.gitSha,
          deploymentId: rollback.target.deploymentId,
          pagesProject: rollback.target.pagesProject,
          configFingerprint: reconstruct?.configFingerprint || null,
        }
      : null,
    phaseResults,
    reconstruct: reconstruct
      ? {
          ok: reconstruct.ok,
          workflowCount: reconstruct.workflowCount,
          migrationCount: reconstruct.migrationCount,
          configFingerprint: reconstruct.configFingerprint,
          durationMs: reconstruct.durationMs,
        }
      : null,
    nestedIsolation: nestedIsolation
      ? {
          ok: nestedIsolation.ok,
          disabled: Boolean(nestedIsolation.disabled),
          skipped: Boolean(nestedIsolation.skipped),
          recommendation: nestedIsolation.summary?.recommendation || null,
          productionMutation: nestedIsolation.productionMutation,
        }
      : null,
    communications: communications
      ? { ok: communications.ok, sha256: communications.sha256 }
      : null,
    returnToService: returnToService
      ? { ok: returnToService.ok, checkCount: returnToService.checks.length }
      : null,
    limitations: [
      'Synthetic candidate SHAs/deployment IDs only — not live Cloudflare Pages rollback.',
      'No Production outage, DNS, or traffic mutation is authorized or performed.',
      'Nested D1/B2 evidence reuses #2895 synthetic fixtures; live restore remains deferred.',
      'Measured times are local exercise durations; Production RTO still uses launch-package targets until live drills.',
      'Day-2 Production recovery activation remains separately authorized (#2897 / incident path).',
    ],
    cleanupOk,
    checks,
    summary: {
      blockerFailures: blockers.map((b) => b.name),
      recommendation: ok
        ? 'ROLLBACK_INTEGRATED_DR_PROOF_READY_FOR_REVIEW'
        : 'ROLLBACK_INTEGRATED_DR_PROOF_BLOCKED',
      productionMutation: 'not_authorized',
    },
  };
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(
      `Usage: node scripts/ci/platform-recovery-rollback-integrated-dr.mjs [--json]\n`,
    );
    process.stdout.write(`Disable: ${DISABLE_ENV}=1\n`);
    process.stdout.write(
      `Protected stops (fail closed): ${FORCE_PRODUCTION_ROLLBACK}=1 | ${FORCE_PRODUCTION_OUTAGE}=1 | ${FORCE_PRODUCTION_DR}=1\n`,
    );
    process.exit(0);
  }

  const result = runPlatformRecoveryRollbackIntegratedDr();
  if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(
      `#2896 rollback + integrated DR proof: ${result.ok ? 'PASS' : 'FAIL'}\n`,
    );
    if (result.disabled) {
      process.stdout.write(`Disabled via ${result.disableEnv}\n`);
    } else {
      process.stdout.write(`Observed: ${result.observedAt}\n`);
      process.stdout.write(`SHA: ${result.headSha || '(unknown)'}\n`);
      if (result.candidate) {
        process.stdout.write(
          `Candidate: ${result.candidate.gitSha} / ${result.candidate.deploymentId}\n`,
        );
      }
      process.stdout.write(
        `Measured: reconstruct=${result.measured?.reconstructMs}ms nestedIso=${result.measured?.nestedIsolationMs}ms total=${result.measured?.totalMs}ms\n`,
      );
      for (const c of result.checks) {
        process.stdout.write(`  [${c.ok ? 'ok' : 'FAIL'}] ${c.name}: ${c.detail}\n`);
      }
      process.stdout.write(`Recommendation: ${result.summary.recommendation}\n`);
      if (result.limitations?.length) {
        process.stdout.write('Limitations:\n');
        for (const l of result.limitations) process.stdout.write(`  - ${l}\n`);
      }
    }
  }
  process.exit(result.ok ? 0 : 1);
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main();
}
