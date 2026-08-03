#!/usr/bin/env node
/**
 * #2894 / #2779-001 — recovery inventory structure check.
 *
 * Validates that every launch-critical asset records backup method, retention,
 * RPO/RTO, credential boundary, owner, test plan, and tested/untested status.
 * No Production mutation. No secret values.
 *
 * Usage:
 *   node scripts/ci/platform-recovery-inventory.mjs
 *   node scripts/ci/platform-recovery-inventory.mjs --json
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '../..');

const DISABLE_ENV = 'LGFC_PLATFORM_RECOVERY_INVENTORY_DISABLED';

/** Launch-critical assets consumed from #2778 inventory + #2779 recovery classes. */
export const RECOVERY_ASSETS = Object.freeze([
  {
    id: 'git_source',
    class: 'source_configuration',
    name: 'Git source repository (wdhunter645/next-starter-template)',
    owner: 'Implementation / Operations',
    backupMethod: 'GitHub remote + local clones; immutable commits',
    retention: 'Git history retained by GitHub; branch protection on main',
    rpo: 'last accepted Git commit',
    rto: '4 hours',
    credentialBoundary: 'none for public clone; write requires GitHub auth (not stored in inventory)',
    isolatedTestPlan: 'Clone clean tip to disposable worktree; verify tree and docs/scripts present',
    testedStatus: 'untested_restore',
    zeroCostBaseline: true,
  },
  {
    id: 'github_workflows_config',
    class: 'source_configuration',
    name: 'GitHub Actions workflows and repository configuration',
    owner: 'Implementation / Operations + Deterministic CI',
    backupMethod: 'Versioned under `.github/` in Git',
    retention: 'Same as Git history',
    rpo: 'last accepted Git commit',
    rto: '4 hours',
    credentialBoundary: 'Workflow secrets are names-only here; values in GitHub Secrets / Pages env',
    isolatedTestPlan: 'Checkout workflow files on disposable branch; `actionlint`/dry parse only — no live deploy',
    testedStatus: 'untested_restore',
    zeroCostBaseline: true,
  },
  {
    id: 'wrangler_pages_config',
    class: 'source_configuration',
    name: 'Cloudflare Pages / Wrangler config (`wrangler.toml`, build `out/`)',
    owner: 'PMO / Engineering (contract) + Implementation / Operations (as-built)',
    backupMethod: 'Git; Cloudflare dashboard settings are separate live state',
    retention: 'Git history; dashboard settings retention per Cloudflare',
    rpo: 'last accepted Git commit (repo); live dashboard drift TBD until credentialed read',
    rto: '4 hours (repo reconstruct); live bind confirm requires credentials',
    credentialBoundary: 'CLOUDFLARE_API_TOKEN / ACCOUNT_ID names only; no values',
    isolatedTestPlan: 'Parse `wrangler.toml` offline; compare to #2778 inventory declarations',
    testedStatus: 'untested_restore',
    zeroCostBaseline: true,
  },
  {
    id: 'pages_functions',
    class: 'source_configuration',
    name: 'Pages Functions (`functions/**`)',
    owner: 'Implementation / Operations',
    backupMethod: 'Git',
    retention: 'Git history',
    rpo: 'last accepted Git commit',
    rto: '4 hours',
    credentialBoundary: 'Runtime secrets injected by Pages env — names only in inventory',
    isolatedTestPlan: 'Unit/fixture tests on disposable checkout; no Production deploy',
    testedStatus: 'untested_restore',
    zeroCostBaseline: true,
  },
  {
    id: 'd1_database',
    class: 'd1_operational_data',
    name: 'D1 database `lgfc_lite` (binding `DB`, id `22d0dc3e-ad34-43af-8e6a-2063df1a1e04`)',
    owner: 'Day-2 Operations (activation) + Implementation / Operations (tooling)',
    backupMethod: 'Provider durability + synthetic export/restore proof (#2895); live wrangler export when credentials authorized',
    retention: 'Target: retain last successful export ≥ 7 days locally/artifact store when implemented; provider defaults otherwise',
    rpo: '24 hours (target until measured live)',
    rto: '8 hours (target; local isolated proof measured in #2895)',
    credentialBoundary: 'CLOUDFLARE_API_TOKEN + account/database ids; export artifacts must be redacted/access-controlled',
    isolatedTestPlan: 'Synthetic SQL export → integrity hash → isolated local SQLite restore → app checks → cleanup (`npm run validate:platform-d1-b2-recovery-proof`). Live Cloudflare disposable D1 deferred.',
    testedStatus: 'partial',
    zeroCostBaseline: true,
  },
  {
    id: 'd1_migrations',
    class: 'source_configuration',
    name: 'D1 migration SQL (`migrations/**`)',
    owner: 'Implementation / Operations',
    backupMethod: 'Git',
    retention: 'Git history',
    rpo: 'last accepted Git commit',
    rto: '4 hours',
    credentialBoundary: 'none',
    isolatedTestPlan: 'Apply migrations to isolated D1 only; known prefix collisions 0020/0028/0044 recorded as debt',
    testedStatus: 'untested_restore',
    zeroCostBaseline: true,
  },
  {
    id: 'b2_media_bucket',
    class: 'b2_media',
    name: 'Backblaze B2 bucket `LouGehrigFanClub`',
    owner: 'Day-2 Operations (activation) + Product Authority (credentials/cost)',
    backupMethod: 'Provider object durability + synthetic integrity sampling (#2895); live ListObjectsV2 when credentials authorized',
    retention: 'Provider-retained objects; catalog/index RPO target 24h via D1 sync assumptions',
    rpo: '24 hours (catalog/index state target); object durability per provider',
    rto: '24 hours (target; local isolated proof measured in #2895)',
    credentialBoundary: 'B2_KEY_ID / B2_APP_KEY / endpoint / bucket names only',
    isolatedTestPlan: 'Synthetic catalog integrity sample + no Production deletes (`npm run validate:platform-d1-b2-recovery-proof`). Live B2 read sample deferred.',
    testedStatus: 'partial',
    zeroCostBaseline: true,
  },
  {
    id: 'b2_d1_catalog_sync',
    class: 'b2_media',
    name: 'B2↔D1 media catalog / sync tooling and workflow',
    owner: 'Implementation / Operations',
    backupMethod: 'Git for tooling; D1 rows for catalog; B2 for objects; synthetic reconcile proven in #2895',
    retention: 'Git + D1 export cadence when proven',
    rpo: '24 hours (catalog target)',
    rto: '24 hours (target; local reconcile measured in #2895)',
    credentialBoundary: 'Admin sync requires ADMIN_TOKEN + B2 creds — Production activation only',
    isolatedTestPlan: 'Reconcile synthetic B2 catalog keys to restored media_assets.b2_key (#2895). Credentialed dry-run sync remains deferred.',
    testedStatus: 'partial',
    zeroCostBaseline: true,
  },
  {
    id: 'deployment_runtime',
    class: 'deployment_runtime',
    name: 'Cloudflare Pages deployment / immutable candidate rollback',
    owner: 'Day-2 Operations (activation) + Implementation / Operations (procedure)',
    backupMethod: 'Immutable Pages deployment history; Git SHA identity; `docs/how-to/website/website-production-rollback.md`',
    retention: 'Cloudflare deployment history per provider; Git tags/SHAs indefinitely',
    rpo: 'last accepted immutable candidate',
    rto: '2 hours',
    credentialBoundary: 'Cloudflare deploy token / dashboard access — operator only',
    isolatedTestPlan: 'Document exact candidate SHA selection; practice rollback steps on non-Production Pages project when provisioned — else tabletop until authorized',
    testedStatus: 'untested_restore',
    zeroCostBaseline: true,
  },
  {
    id: 'domains_dns',
    class: 'source_configuration',
    name: 'Production domains / DNS (`www.lougehrigfanclub.com`, pages.dev hostname)',
    owner: 'Product Authority (domain) + Day-2 Operations (incident DNS)',
    backupMethod: 'Registrar/DNS provider records; documented in #2778 inventory',
    retention: 'Provider DNS history / export if available',
    rpo: 'last known-good DNS configuration documentation',
    rto: '4 hours (documentation reconstruct); registrar changes may be longer',
    credentialBoundary: 'Registrar/Cloudflare DNS credentials — Product Authority / Day-2 only',
    isolatedTestPlan: 'Tabletop: rebuild expected records from #2778 inventory; no live DNS mutation in this task',
    testedStatus: 'untested_restore',
    zeroCostBaseline: true,
  },
  {
    id: 'operational_evidence',
    class: 'source_configuration',
    name: 'Operational evidence (Issues/PRs/#2778 reports on component tip)',
    owner: 'Administration & Communications',
    backupMethod: 'GitHub Issues/PRs; component branch docs under `docs/ops/reports/` on `component/platform-production-validation`',
    retention: 'GitHub retention + Git history when merged',
    rpo: 'last accepted evidence commit / Issue comment',
    rto: '4 hours',
    credentialBoundary: 'none for public repo metadata',
    isolatedTestPlan: 'Verify cited #2778 report paths exist on `origin/component/platform-production-validation`',
    testedStatus: 'partial',
    zeroCostBaseline: true,
  },
  {
    id: 'secrets_boundary',
    class: 'source_configuration',
    name: 'Secrets and env var boundary (names only)',
    owner: 'Product Authority (credentials) + Day-2 Operations (rotation execution when authorized)',
    backupMethod: 'Secret *names* inventoried in #2778; values never backed up into Git',
    retention: 'Provider secret stores only',
    rpo: 'n/a for values — presence checklist only',
    rto: 'n/a — rotation is protected decision',
    credentialBoundary: 'VALUES NEVER IN REPO / ISSUES / PRS / EVIDENCE',
    isolatedTestPlan: 'Presence-name checklist only; no value export',
    testedStatus: 'untested_restore',
    zeroCostBaseline: true,
  },
]);

export const REQUIRED_ASSET_FIELDS = Object.freeze([
  'id',
  'class',
  'name',
  'owner',
  'backupMethod',
  'retention',
  'rpo',
  'rto',
  'credentialBoundary',
  'isolatedTestPlan',
  'testedStatus',
  'zeroCostBaseline',
]);

export const REQUIRED_CLASSES = Object.freeze([
  'source_configuration',
  'd1_operational_data',
  'b2_media',
  'deployment_runtime',
]);

export const ALLOWED_TESTED_STATUS = Object.freeze([
  'tested',
  'partial',
  'untested_restore',
]);

export const REQUIRED_DOCS = Object.freeze([
  'docs/ops/reports/platform-recovery-readiness-inventory.md',
  'docs/reference/operations/platform-recovery-ownership.md',
]);

export const CONSUMED_2778_EVIDENCE = Object.freeze([
  'docs/ops/reports/platform-production-validation-repository-live-inventory.md',
  'docs/ops/reports/platform-production-validation-cf-d1-checks.md',
  'docs/ops/reports/platform-production-validation-b2-runtime-checks.md',
  'docs/ops/reports/platform-production-validation-candidate-qualification.md',
]);

export const PROTECTED_DECISIONS = Object.freeze([
  {
    id: 'no_production_restore',
    note: 'No destructive Production restore or outage simulation without Day-2 + Product Authority.',
  },
  {
    id: 'no_secret_values',
    note: 'Secret values must never appear in inventory, Issues, PRs, or artifacts.',
  },
  {
    id: 'zero_cost_baseline',
    note: 'Baseline uses existing GitHub/Cloudflare/B2 capabilities; paid backup products require Product Authority.',
  },
  {
    id: 'credentialed_live_deferred',
    note: 'Credentialed live CF/D1/B2 verification deferred from #2778; circle back for Production Go prep — non-blocking for #2779 Development.',
  },
  {
    id: 'production_go_separate',
    note: 'Production recovery activation and #2778 Production Go remain separately authorized.',
  },
]);

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function gitSha() {
  const r = spawnSync('git', ['-C', REPO_ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function gitShowExists(refPath) {
  const r = spawnSync('git', ['-C', REPO_ROOT, 'cat-file', '-e', refPath], { encoding: 'utf8' });
  return r.status === 0;
}

export function isToolingDisabled(env = process.env) {
  const raw = String(env[DISABLE_ENV] || '')
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export function validateAsset(asset) {
  const missing = REQUIRED_ASSET_FIELDS.filter((f) => asset[f] === undefined || asset[f] === null || asset[f] === '');
  const statusOk = ALLOWED_TESTED_STATUS.includes(asset.testedStatus);
  const zeroCost = asset.zeroCostBaseline === true;
  return {
    id: asset.id,
    ok: missing.length === 0 && statusOk && zeroCost,
    missing,
    statusOk,
    zeroCost,
  };
}

export function runPlatformRecoveryInventory(opts = {}) {
  const env = opts.env || process.env;
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
      sourceIssue: '#2894',
      parentProject: '#2779',
      checks: [
        {
          name: 'tooling_disabled',
          ok: true,
          detail: `${DISABLE_ENV} set; inventory check skipped`,
          severity: 'info',
        },
      ],
      summary: { recommendation: 'DISABLED', productionMutation: 'not_authorized' },
    };
  }

  const checks = [];
  const candidateSha = opts.candidateSha || gitSha();

  for (const rel of REQUIRED_DOCS) {
    const abs = join(REPO_ROOT, rel);
    checks.push({
      name: `doc_present:${rel}`,
      ok: existsSync(abs),
      detail: existsSync(abs) ? 'present' : 'missing',
    });
  }

  const classes = new Set(RECOVERY_ASSETS.map((a) => a.class));
  for (const c of REQUIRED_CLASSES) {
    checks.push({
      name: `class_covered:${c}`,
      ok: classes.has(c),
      detail: classes.has(c) ? 'present' : 'missing class',
    });
  }

  const assetResults = RECOVERY_ASSETS.map(validateAsset);
  for (const r of assetResults) {
    checks.push({
      name: `asset_complete:${r.id}`,
      ok: r.ok,
      detail: r.ok
        ? 'fields complete; zero-cost baseline; testedStatus allowed'
        : `missing=${r.missing.join(',') || 'none'}; statusOk=${r.statusOk}; zeroCost=${r.zeroCost}`,
    });
  }

  const untestedOrPartial = RECOVERY_ASSETS.filter((a) => a.testedStatus !== 'tested');
  checks.push({
    name: 'explicit_untested_status',
    ok: untestedOrPartial.length === RECOVERY_ASSETS.filter((a) => a.testedStatus !== 'tested').length,
    detail: `${untestedOrPartial.length}/${RECOVERY_ASSETS.length} assets not fully restore-tested (D1/B2 partial after #2895; others remain for later children)`,
    severity: 'info',
  });

  for (const d of PROTECTED_DECISIONS) {
    checks.push({
      name: `protected_decision:${d.id}`,
      ok: true,
      detail: d.note,
      severity: 'info',
    });
  }

  // Consume #2778 evidence from sibling component branch when available.
  const siblingRef = 'origin/component/platform-production-validation';
  let consumedOk = 0;
  for (const rel of CONSUMED_2778_EVIDENCE) {
    const refPath = `${siblingRef}:${rel}`;
    const ok = gitShowExists(refPath);
    if (ok) consumedOk += 1;
    checks.push({
      name: `consumed_2778:${rel}`,
      ok,
      detail: ok ? `found at ${refPath}` : `missing at ${refPath} (fetch sibling component if needed)`,
    });
  }

  checks.push({
    name: 'package_script_present',
    ok: Boolean(JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')).scripts?.['validate:platform-recovery-inventory']),
    detail: 'package.json scripts.validate:platform-recovery-inventory',
  });

  const blocking = checks.filter((c) => !c.ok && c.severity !== 'info');
  const ok = blocking.length === 0;

  return {
    ok,
    disabled: false,
    disableEnv: DISABLE_ENV,
    productionMutation: false,
    writeAttempts: 0,
    observedAt: now,
    actorRole,
    sourceIssue: '#2894',
    parentProject: '#2779',
    componentBranch: 'component/platform-recovery-readiness',
    candidateSha,
    assetCount: RECOVERY_ASSETS.length,
    consumed2778Count: consumedOk,
    protectedDecisions: PROTECTED_DECISIONS,
    assets: RECOVERY_ASSETS,
    checks,
    fingerprint: createHash('sha256')
      .update(JSON.stringify(RECOVERY_ASSETS.map((a) => a.id)))
      .digest('hex')
      .slice(0, 16),
    summary: {
      recommendation: ok ? 'RECOVERY_INVENTORY_READY_FOR_REVIEW' : 'NOT_READY',
      productionMutation: 'not_authorized',
      blockingFailures: blocking.map((c) => c.name),
      zeroCostBaseline: RECOVERY_ASSETS.every((a) => a.zeroCostBaseline === true),
    },
  };
}

function printHelp() {
  console.log(`Usage: node scripts/ci/platform-recovery-inventory.mjs [--json] [--help]

Disable: ${DISABLE_ENV}=1
`);
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  const result = runPlatformRecoveryInventory();
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`platform-recovery-inventory ok=${result.ok} disabled=${result.disabled}`);
    console.log(`candidateSha=${result.candidateSha}`);
    console.log(`assets=${result.assetCount} recommendation=${result.summary.recommendation}`);
    for (const c of result.checks) {
      const mark = c.ok ? 'PASS' : 'FAIL';
      console.log(`  [${mark}] ${c.name}: ${c.detail}`);
    }
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
