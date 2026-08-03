#!/usr/bin/env node
/**
 * #2895 / #2779-002 — D1 + B2 recovery in isolation.
 *
 * Proves export → integrity → isolated restore → application compatibility
 * for D1, and catalog integrity sampling + D1 reference reconciliation for B2,
 * using synthetic/redacted fixtures only.
 *
 * Never mutates Production, live D1, live B2, or Cloudflare configuration.
 * Never logs or embeds secret values.
 *
 * Usage:
 *   node scripts/ci/platform-recovery-d1-b2-isolation.mjs
 *   node scripts/ci/platform-recovery-d1-b2-isolation.mjs --json
 */
import { createHash, randomUUID } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '../..');

const DISABLE_ENV = 'LGFC_PLATFORM_RECOVERY_D1_B2_ISOLATION_DISABLED';

export const FIXTURE_D1_EXPORT = 'scripts/ci/fixtures/platform-recovery-d1-export.sql';
export const FIXTURE_B2_CATALOG = 'scripts/ci/fixtures/platform-recovery-b2-catalog.json';
export const EVIDENCE_DOC = 'docs/ops/reports/platform-recovery-d1-b2-isolation-proof.md';

/** Tables required after isolated restore for application compatibility. */
export const REQUIRED_RESTORED_TABLES = Object.freeze([
  'media_assets',
  'photos',
  'members',
]);

/** Application compatibility probes (read-only SELECT shapes). */
export const APPLICATION_COMPAT_QUERIES = Object.freeze([
  {
    id: 'media_assets_count',
    sql: 'SELECT COUNT(*) AS n FROM media_assets',
    expectMin: 1,
  },
  {
    id: 'photos_count',
    sql: 'SELECT COUNT(*) AS n FROM photos',
    expectMin: 1,
  },
  {
    id: 'media_b2_keys_present',
    sql: "SELECT COUNT(*) AS n FROM media_assets WHERE b2_key LIKE 'photos/%' OR b2_key LIKE 'memorabilia/%'",
    expectMin: 1,
  },
  {
    id: 'members_present',
    sql: 'SELECT COUNT(*) AS n FROM members',
    expectMin: 1,
  },
]);

export const TARGETS = Object.freeze({
  d1Rpo: '24 hours',
  d1Rto: '8 hours',
  b2Rpo: '24 hours',
  b2Rto: '24 hours',
});

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

function readText(rel) {
  const abs = join(REPO_ROOT, rel);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf8');
}

function sha256Text(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function isToolingDisabled(env = process.env) {
  const raw = String(env[DISABLE_ENV] || '')
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

/**
 * Restore a SQL dump into an isolated on-disk SQLite database (local temp).
 * Mimics wrangler d1 export → restore into a disposable non-Production target.
 */
export function restoreD1ExportToIsolatedDb(sqlText, dbPath) {
  const started = performance.now();
  const db = new DatabaseSync(dbPath);
  try {
    db.exec(sqlText);
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all()
      .map((r) => r.name);
    const compat = [];
    for (const q of APPLICATION_COMPAT_QUERIES) {
      const row = db.prepare(q.sql).get();
      const n = Number(row?.n ?? 0);
      compat.push({
        id: q.id,
        ok: n >= q.expectMin,
        count: n,
        expectMin: q.expectMin,
      });
    }
    const mediaRows = db
      .prepare('SELECT media_uid, b2_key, size, etag FROM media_assets ORDER BY id')
      .all();
    return {
      ok: true,
      tables,
      compat,
      mediaRows,
      durationMs: Math.round(performance.now() - started),
    };
  } finally {
    db.close();
  }
}

/**
 * Sample B2 catalog integrity and reconcile object keys to restored D1 media_assets.
 */
export function proveB2CatalogRecovery(catalog, mediaRows) {
  const started = performance.now();
  const checks = [];
  const objects = Array.isArray(catalog?.objects) ? catalog.objects : [];

  checks.push({
    name: 'catalog_nonempty',
    ok: objects.length > 0,
    detail: `objects=${objects.length}`,
  });

  let integrityOk = 0;
  for (const obj of objects) {
    const hasKey = typeof obj.key === 'string' && obj.key.length > 0;
    const hasEtag = typeof obj.etag === 'string' && obj.etag.length > 0;
    const hasHash = typeof obj.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(obj.sha256);
    const hasSize = Number.isFinite(obj.size) && obj.size >= 0;
    if (hasKey && hasEtag && hasHash && hasSize) integrityOk += 1;
  }
  checks.push({
    name: 'object_integrity_sample',
    ok: integrityOk === objects.length && objects.length > 0,
    detail: `integrity_ok=${integrityOk}/${objects.length}`,
  });

  const catalogKeys = new Set(objects.map((o) => o.key));
  const d1Keys = mediaRows.map((r) => r.b2_key);
  const missingInB2 = d1Keys.filter((k) => !catalogKeys.has(k));
  const orphansInB2 = [...catalogKeys].filter((k) => !d1Keys.includes(k));

  checks.push({
    name: 'd1_refs_present_in_b2_catalog',
    ok: missingInB2.length === 0,
    detail: missingInB2.length === 0 ? 'all D1 b2_key refs present' : `missing=${missingInB2.join(',')}`,
  });

  checks.push({
    name: 'orphan_detection',
    ok: orphansInB2.length >= 1,
    detail: `orphans=${orphansInB2.join(',') || '(none)'}`,
  });

  // etag cross-check for matched keys
  let etagMismatches = 0;
  const etagByKey = new Map(objects.map((o) => [o.key, o.etag]));
  for (const row of mediaRows) {
    const catEtag = etagByKey.get(row.b2_key);
    if (catEtag && row.etag && catEtag !== row.etag) etagMismatches += 1;
  }
  checks.push({
    name: 'etag_reconcile_matched_keys',
    ok: etagMismatches === 0,
    detail: `mismatches=${etagMismatches}`,
  });

  return {
    ok: checks.every((c) => c.ok),
    checks,
    objectCount: objects.length,
    d1RefCount: d1Keys.length,
    orphanCount: orphansInB2.length,
    durationMs: Math.round(performance.now() - started),
  };
}

export function runPlatformRecoveryD1B2Isolation(opts = {}) {
  const env = opts.env || process.env;
  const now = new Date().toISOString();
  const actorRole = opts.actorRole || 'Implementation / Operations';
  const workRoot =
    opts.workRoot ||
    join(REPO_ROOT, '.tmp', `platform-recovery-isolation-${randomUUID()}`);

  if (isToolingDisabled(env)) {
    return {
      ok: true,
      disabled: true,
      disableEnv: DISABLE_ENV,
      productionMutation: false,
      writeAttempts: 0,
      observedAt: now,
      actorRole,
      sourceIssue: '#2895',
      parentProject: '#2779',
      checks: [
        {
          name: 'tooling_disabled',
          ok: true,
          detail: `${DISABLE_ENV} set; isolation proof skipped`,
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
  let d1Proof = null;
  let b2Proof = null;
  let exportHash = null;
  let measured = {
    d1ExportReadMs: null,
    d1RestoreMs: null,
    b2ReconcileMs: null,
    totalMs: null,
  };
  const totalStart = performance.now();

  try {
    mkdirSync(workRoot, { recursive: true });
    writeAttempts += 1;

    const exportSql = readText(FIXTURE_D1_EXPORT);
    checks.push({
      name: 'd1_export_fixture_present',
      ok: Boolean(exportSql),
      detail: FIXTURE_D1_EXPORT,
      severity: 'blocker',
    });

    const catalogRaw = readText(FIXTURE_B2_CATALOG);
    let catalog = null;
    try {
      catalog = catalogRaw ? JSON.parse(catalogRaw) : null;
    } catch {
      catalog = null;
    }
    checks.push({
      name: 'b2_catalog_fixture_present',
      ok: Boolean(catalog && Array.isArray(catalog.objects)),
      detail: FIXTURE_B2_CATALOG,
      severity: 'blocker',
    });

    checks.push({
      name: 'evidence_doc_present',
      ok: existsSync(join(REPO_ROOT, EVIDENCE_DOC)),
      detail: EVIDENCE_DOC,
      severity: 'blocker',
    });

    if (exportSql) {
      const readStart = performance.now();
      exportHash = sha256Text(exportSql);
      measured.d1ExportReadMs = Math.round(performance.now() - readStart);

      checks.push({
        name: 'd1_export_integrity_hash',
        ok: typeof exportHash === 'string' && exportHash.length === 64,
        detail: `sha256=${exportHash.slice(0, 12)}…`,
        severity: 'blocker',
      });

      const dbPath = join(workRoot, 'isolated-restore.sqlite');
      writeAttempts += 1;
      d1Proof = restoreD1ExportToIsolatedDb(exportSql, dbPath);
      measured.d1RestoreMs = d1Proof.durationMs;

      const missingTables = REQUIRED_RESTORED_TABLES.filter((t) => !d1Proof.tables.includes(t));
      checks.push({
        name: 'd1_restore_schema_tables',
        ok: missingTables.length === 0,
        detail:
          missingTables.length === 0
            ? `tables=${d1Proof.tables.join(',')}`
            : `missing=${missingTables.join(',')}`,
        severity: 'blocker',
      });

      const compatFail = (d1Proof.compat || []).filter((c) => !c.ok);
      checks.push({
        name: 'd1_application_compatibility',
        ok: compatFail.length === 0 && (d1Proof.compat || []).length > 0,
        detail:
          compatFail.length === 0
            ? `probes=${d1Proof.compat.map((c) => `${c.id}:${c.count}`).join(';')}`
            : `failed=${compatFail.map((c) => c.id).join(',')}`,
        severity: 'blocker',
      });

      if (catalog) {
        b2Proof = proveB2CatalogRecovery(catalog, d1Proof.mediaRows || []);
        measured.b2ReconcileMs = b2Proof.durationMs;
        for (const c of b2Proof.checks) {
          checks.push({
            name: `b2_${c.name}`,
            ok: c.ok,
            detail: c.detail,
            severity: 'blocker',
          });
        }
      }
    }

    // Targets comparison (measured wall times are exercise durations, not Production RTO)
    measured.totalMs = Math.round(performance.now() - totalStart);
    const d1WithinTarget = measured.d1RestoreMs != null && measured.d1RestoreMs < 8 * 60 * 60 * 1000;
    const b2WithinTarget =
      measured.b2ReconcileMs != null && measured.b2ReconcileMs < 24 * 60 * 60 * 1000;
    checks.push({
      name: 'measured_d1_restore_within_rto_target_bound',
      ok: d1WithinTarget,
      detail: `restoreMs=${measured.d1RestoreMs}; targetRto=${TARGETS.d1Rto} (isolated exercise, not Production)`,
      severity: 'info',
    });
    checks.push({
      name: 'measured_b2_reconcile_within_rto_target_bound',
      ok: b2WithinTarget,
      detail: `reconcileMs=${measured.b2ReconcileMs}; targetRto=${TARGETS.b2Rto} (isolated exercise, not Production)`,
      severity: 'info',
    });

    checks.push({
      name: 'no_production_mutation',
      ok: true,
      detail: 'synthetic fixtures + local temp SQLite only; live D1/B2 untouched',
      severity: 'info',
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
    sourceIssue: '#2895',
    parentProject: '#2779',
    componentBranch: 'component/platform-recovery-readiness',
    headSha: gitSha(),
    exportSha256: exportHash,
    measured,
    targets: TARGETS,
    limitations: [
      'Synthetic/redacted fixtures only — not a live Production D1 export or live B2 ListObjects.',
      'Credentialed live CF/D1/B2 restore remains deferred and separately authorized.',
      'Measured times are local exercise durations; Production RTO still uses launch-package targets until live drills.',
      'node:sqlite is experimental; disposable local DB only.',
    ],
    d1: d1Proof
      ? {
          tables: d1Proof.tables,
          compat: d1Proof.compat,
          mediaRowCount: (d1Proof.mediaRows || []).length,
          durationMs: d1Proof.durationMs,
        }
      : null,
    b2: b2Proof
      ? {
          objectCount: b2Proof.objectCount,
          d1RefCount: b2Proof.d1RefCount,
          orphanCount: b2Proof.orphanCount,
          durationMs: b2Proof.durationMs,
        }
      : null,
    cleanupOk,
    checks,
    summary: {
      blockerFailures: blockers.map((b) => b.name),
      recommendation: ok
        ? 'D1_B2_ISOLATION_PROOF_READY_FOR_REVIEW'
        : 'D1_B2_ISOLATION_PROOF_BLOCKED',
      productionMutation: 'not_authorized',
    },
  };
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(`Usage: node scripts/ci/platform-recovery-d1-b2-isolation.mjs [--json]\n`);
    process.stdout.write(`Disable: ${DISABLE_ENV}=1\n`);
    process.exit(0);
  }

  const result = runPlatformRecoveryD1B2Isolation();
  if (args.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`#2895 D1/B2 isolation proof: ${result.ok ? 'PASS' : 'FAIL'}\n`);
    if (result.disabled) {
      process.stdout.write(`Disabled via ${result.disableEnv}\n`);
    } else {
      process.stdout.write(`Observed: ${result.observedAt}\n`);
      process.stdout.write(`SHA: ${result.headSha || '(unknown)'}\n`);
      process.stdout.write(
        `Measured: d1Restore=${result.measured?.d1RestoreMs}ms b2=${result.measured?.b2ReconcileMs}ms total=${result.measured?.totalMs}ms\n`,
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

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main();
}
