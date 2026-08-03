#!/usr/bin/env node
/**
 * #2893 / #2778-004 — Promotion Candidate qualification for platform production validation.
 *
 * Aggregates prior task evidence (#2890–#2892), re-runs child validators in
 * skip-http mode, proves independent tooling disable, and records candidate
 * identity. Never mutates Production, D1, B2, or Cloudflare configuration.
 *
 * Usage:
 *   node scripts/ci/platform-candidate-qualification.mjs
 *   node scripts/ci/platform-candidate-qualification.mjs --json
 *   node scripts/ci/platform-candidate-qualification.mjs --skip-child-validators
 *   LGFC_PLATFORM_VALIDATION_DISABLED=1 node scripts/ci/platform-candidate-qualification.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runPlatformCfD1Validation } from './platform-cf-d1-validation.mjs';
import { runPlatformB2RuntimeValidation } from './platform-b2-runtime-validation.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '../..');

export const REQUIRED_EVIDENCE_REPORTS = Object.freeze([
  'docs/ops/reports/platform-production-validation-repository-live-inventory.md',
  'docs/ops/reports/platform-production-validation-cf-d1-checks.md',
  'docs/ops/reports/platform-production-validation-b2-runtime-checks.md',
]);

export const REQUIRED_TOOLING = Object.freeze([
  'scripts/ci/platform-cf-d1-validation.mjs',
  'scripts/ci/platform-b2-runtime-validation.mjs',
  'tests/platform-cf-d1-validation.test.mjs',
  'tests/platform-b2-runtime-validation.test.mjs',
]);

export const REQUIRED_HANDOFF_DOCS = Object.freeze([
  'docs/ops/reports/platform-production-validation-candidate-qualification.md',
  'docs/how-to/operations/run-platform-production-validation.md',
  'docs/reference/operations/platform-production-validation-ownership.md',
]);

/** Explicit protected follow-ups carried from prior tasks (names only; no secrets). */
export const PROTECTED_UNRESOLVED_ITEMS = Object.freeze([
  {
    id: 'live_cloudflare_api_inventory',
    source: '#2890/#2891',
    status: 'open',
    note: 'Credentialed Cloudflare API/dashboard inventory and live D1 schema read remain operator follow-ups.',
  },
  {
    id: 'migration_prefix_collisions',
    source: '#2890/#2891',
    status: 'open',
    note: 'Migration filename prefix collisions 0020/0028/0044 require separate remediation authority.',
  },
  {
    id: 'pages_name_drift',
    source: '#2890/#2891',
    status: 'open',
    note: 'wrangler name lgfc-lite vs documented/workflow Pages project next-starter-template.',
  },
  {
    id: 'live_b2_list_read',
    source: '#2892',
    status: 'open',
    note: 'Credentialed B2 ListObjectsV2 + aws CLI operator run remains fail-closed without secrets.',
  },
  {
    id: 'b2_cors_console_finalization',
    source: '#2892',
    status: 'open',
    note: 'Public B2 CORS preflight incomplete (not PASS); console finalization needs Product Authority.',
  },
  {
    id: 'production_go',
    source: '#2778',
    status: 'blocked_until_authorized',
    note: 'Production / main merge and Production mutation remain separately authorized; not granted by #2893.',
  },
]);

const DISABLE_ENV = 'LGFC_PLATFORM_VALIDATION_DISABLED';

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
    skipChildValidators: argv.includes('--skip-child-validators'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function git(args) {
  const r = spawnSync('git', ['-C', REPO_ROOT, ...args], { encoding: 'utf8' });
  return {
    status: r.status,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
  };
}

export function resolveCandidateIdentity(opts = {}) {
  const sha = opts.candidateSha || git(['rev-parse', 'HEAD']).stdout || null;
  if (opts.worktree) return opts.worktree;
  const porcelain = git(['status', '--porcelain']).stdout || '';
  const dirty = Boolean(opts.forceDirty ?? porcelain.trim().length > 0);
  if (!sha) {
    return { dirty: true, identity: null, sha: null, dirtyHash: null };
  }
  if (!dirty) {
    return { dirty: false, identity: sha, sha, dirtyHash: null };
  }
  const dirtyHash = createHash('sha256').update(porcelain).digest('hex').slice(0, 16);
  return {
    dirty: true,
    identity: `${sha}+dirty:${dirtyHash}`,
    sha,
    dirtyHash,
  };
}

function check(name, ok, detail, extra = {}) {
  return { name, ok: Boolean(ok), detail, ...extra };
}

function pathExists(rel) {
  return existsSync(join(REPO_ROOT, rel));
}

function packageHasScript(name) {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
  return Boolean(pkg.scripts?.[name]);
}

/**
 * Prove tooling can be disabled independently of Production state.
 * When DISABLE_ENV is truthy ("1", "true", "yes"), qualification exits as
 * disabled without invoking child validators or live probes.
 */
export function isToolingDisabled(env = process.env) {
  const raw = String(env[DISABLE_ENV] || '')
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export async function runPlatformCandidateQualification(opts = {}) {
  const env = opts.env || process.env;
  const skipChildValidators = Boolean(opts.skipChildValidators);
  const allowDirty = Boolean(opts.allowDirtyWorktree);
  const now = new Date().toISOString();
  const actorRole = opts.actorRole || 'Implementation / Operations';

  if (isToolingDisabled(env)) {
    return {
      ok: true,
      disabled: true,
      disableEnv: DISABLE_ENV,
      productionMutation: false,
      writeAttempts: 0,
      observedAt: now,
      actorRole,
      sourceIssue: '#2893',
      parentProject: '#2778',
      componentBranch: 'component/platform-production-validation',
      candidateIdentity: null,
      checks: [
        check(
          'tooling_disabled',
          true,
          `${DISABLE_ENV} set; qualification skipped without live probes or Production mutation`,
          { severity: 'info' },
        ),
      ],
      protectedUnresolved: PROTECTED_UNRESOLVED_ITEMS,
      childResults: null,
      summary: {
        recommendation: 'DISABLED',
        productionPromotion: 'not_authorized',
      },
    };
  }

  const identity = resolveCandidateIdentity(opts);
  const checks = [];

  checks.push(
    check(
      'candidate_worktree_clean',
      allowDirty || !identity.dirty,
      identity.dirty
        ? allowDirty
          ? `dirty worktree allowed; identity=${identity.identity}`
          : `dirty worktree refuses clean candidate evidence; identity=${identity.identity}`
        : `worktree clean; candidateSha=${identity.identity}`,
      { identity, severity: allowDirty && identity.dirty ? 'info' : undefined },
    ),
  );

  for (const rel of REQUIRED_EVIDENCE_REPORTS) {
    checks.push(
      check(`evidence_present:${rel}`, pathExists(rel), pathExists(rel) ? 'present' : 'missing'),
    );
  }
  for (const rel of REQUIRED_TOOLING) {
    checks.push(
      check(`tooling_present:${rel}`, pathExists(rel), pathExists(rel) ? 'present' : 'missing'),
    );
  }
  for (const rel of REQUIRED_HANDOFF_DOCS) {
    checks.push(
      check(`handoff_doc_present:${rel}`, pathExists(rel), pathExists(rel) ? 'present' : 'missing'),
    );
  }

  checks.push(
    check(
      'npm_script_validate_platform_cf_d1',
      packageHasScript('validate:platform-cf-d1'),
      'package.json scripts.validate:platform-cf-d1',
    ),
  );
  checks.push(
    check(
      'npm_script_validate_platform_b2_runtime',
      packageHasScript('validate:platform-b2-runtime'),
      'package.json scripts.validate:platform-b2-runtime',
    ),
  );
  checks.push(
    check(
      'npm_script_validate_platform_candidate',
      packageHasScript('validate:platform-candidate'),
      'package.json scripts.validate:platform-candidate',
    ),
  );

  // Disable path is documented and env-gated (prove without mutating package.json).
  checks.push(
    check(
      'tooling_disable_env_contract',
      true,
      `${DISABLE_ENV}=1 skips qualification without Production mutation`,
      { severity: 'info', disableEnv: DISABLE_ENV },
    ),
  );

  let childResults = null;
  if (!skipChildValidators) {
    const cf = await runPlatformCfD1Validation({
      skipHttp: true,
      actorRole,
      env,
    });
    const b2 = await runPlatformB2RuntimeValidation({
      skipHttp: true,
      allowDirtyWorktree: allowDirty || identity.dirty,
      actorRole,
      env,
    });
    childResults = {
      cfD1: { ok: cf.ok, productionMutation: cf.productionMutation, writeAttempts: cf.writeAttempts },
      b2Runtime: {
        ok: b2.ok,
        productionMutation: b2.productionMutation,
        writeAttempts: b2.writeAttempts,
      },
    };
    checks.push(
      check(
        'child_cf_d1_skip_http',
        cf.ok === true && cf.productionMutation === false && cf.writeAttempts === 0,
        `cf-d1 ok=${cf.ok}; productionMutation=${cf.productionMutation}; writeAttempts=${cf.writeAttempts}`,
      ),
    );
    checks.push(
      check(
        'child_b2_runtime_skip_http',
        b2.ok === true && b2.productionMutation === false && b2.writeAttempts === 0,
        `b2-runtime ok=${b2.ok}; productionMutation=${b2.productionMutation}; writeAttempts=${b2.writeAttempts}`,
      ),
    );
  } else {
    checks.push(
      check('child_validators_skipped', true, '--skip-child-validators', { severity: 'info' }),
    );
  }

  const blocking = checks.filter((c) => c.ok === false && c.severity !== 'info' && c.severity !== 'fail_closed');
  const ok = blocking.length === 0 && (allowDirty || !identity.dirty);

  return {
    ok,
    disabled: false,
    disableEnv: DISABLE_ENV,
    productionMutation: false,
    writeAttempts: 0,
    observedAt: now,
    actorRole,
    sourceIssue: '#2893',
    parentProject: '#2778',
    componentBranch: 'component/platform-production-validation',
    candidateIdentity: identity.identity,
    candidateSha: identity.sha,
    checks,
    protectedUnresolved: PROTECTED_UNRESOLVED_ITEMS,
    childResults,
    summary: {
      recommendation: ok
        ? 'PROMOTION_CANDIDATE_READY_FOR_INDEPENDENT_REVIEW'
        : 'NOT_READY',
      productionPromotion: 'not_authorized',
      blockingFailures: blocking.map((c) => c.name),
      protectedUnresolvedCount: PROTECTED_UNRESOLVED_ITEMS.length,
    },
  };
}

function printHelp() {
  console.log(`Usage: node scripts/ci/platform-candidate-qualification.mjs [options]

Options:
  --json                   Emit JSON result
  --skip-child-validators  Skip re-running #2891/#2892 validators
  --help                   Show help

Disable (no Production mutation):
  ${DISABLE_ENV}=1         Exit ok with disabled:true; skip probes
`);
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  const result = await runPlatformCandidateQualification({
    skipChildValidators: args.skipChildValidators,
  });
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`platform-candidate-qualification ok=${result.ok} disabled=${result.disabled}`);
    console.log(`candidateIdentity=${result.candidateIdentity || '(none)'}`);
    console.log(`recommendation=${result.summary.recommendation}`);
    console.log(`productionPromotion=${result.summary.productionPromotion}`);
    for (const c of result.checks) {
      const mark = c.ok ? 'PASS' : 'FAIL';
      console.log(`  [${mark}] ${c.name}: ${c.detail}`);
    }
    console.log(`protectedUnresolved=${result.protectedUnresolved.length}`);
  }
  process.exit(result.ok ? 0 : 1);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
