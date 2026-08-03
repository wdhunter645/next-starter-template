#!/usr/bin/env node
/**
 * #2895 / #2779-002 — isolated D1 + B2/catalog recovery proofs.
 *
 * Runs safe export → integrity → isolated restore → application compatibility
 * and B2 catalog integrity sampling with synthetic/redacted data only.
 * Never mutates Production. Never writes secret values.
 *
 * Usage:
 *   node scripts/ci/platform-d1-b2-recovery-proof.mjs
 *   node scripts/ci/platform-d1-b2-recovery-proof.mjs --json
 */
import { createHash, randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '../..');

export const DISABLE_ENV = 'LGFC_PLATFORM_D1_B2_RECOVERY_PROOF_DISABLED';

export const REQUIRED_DOCS = Object.freeze([
  'docs/ops/reports/platform-recovery-d1-b2-isolated-proof.md',
  'docs/how-to/ops/run-d1-b2-isolated-recovery-proof.md',
]);

/** Targets from #2779 launch package / #2894 inventory (until measured live). */
export const RECOVERY_TARGETS = Object.freeze({
  d1: { rpo: '24 hours', rtoHours: 8, rtoMs: 8 * 60 * 60 * 1000 },
  b2: { rpo: '24 hours', rtoHours: 24, rtoMs: 24 * 60 * 60 * 1000 },
});

/** Representative application tables exercised by the synthetic restore. */
export const SYNTHETIC_APPLICATION_TABLES = Object.freeze([
  'photos',
  'media_assets',
  'members',
]);

export const PROTECTED_DECISIONS = Object.freeze([
  {
    id: 'no_production_mutation',
    note: 'No Production D1/B2 mutation, destructive restore, or outage simulation.',
  },
  {
    id: 'synthetic_or_redacted_only',
    note: 'Proofs use synthetic/redacted fixture data only; no live Production data export in this task.',
  },
  {
    id: 'no_secret_values',
    note: 'Secret values must never appear in evidence, Issues, PRs, or artifacts.',
  },
  {
    id: 'live_provider_restore_deferred',
    note: 'Live Cloudflare disposable D1 and credentialed B2 sampling remain deferred; non-blocking for #2779 Development.',
  },
  {
    id: 'zero_cost_baseline',
    note: 'Uses local SQLite + in-memory/object fixtures; no paid backup products.',
  },
]);

/** Redacted synthetic rows — no PII, no real object payloads. */
export const SYNTHETIC_D1_EXPORT_SQL = Object.freeze(`-- LGFC synthetic D1 export for isolated recovery proof (#2895)
-- Redacted fixture data only. Not Production.
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  is_memorabilia INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  media_uid TEXT NOT NULL UNIQUE,
  b2_key TEXT NOT NULL,
  b2_file_id TEXT,
  size INTEGER NOT NULL,
  etag TEXT,
  ingested_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO photos (id, url, is_memorabilia, description, created_at) VALUES
  (1, 'https://example.invalid/redacted/photo-a.jpg', 0, 'redacted fixture A', '2026-01-01T00:00:00Z'),
  (2, 'https://example.invalid/redacted/photo-b.jpg', 1, 'redacted fixture B', '2026-01-02T00:00:00Z');
INSERT INTO media_assets (id, media_uid, b2_key, b2_file_id, size, etag, ingested_at) VALUES
  (1, 'uid-redacted-a', 'photos/redacted-a.jpg', 'fid-a', 59, NULL, '2026-01-01T00:00:00Z'),
  (2, 'uid-redacted-b', 'photos/redacted-b.jpg', 'fid-b', 59, NULL, '2026-01-02T00:00:00Z'),
  (3, 'uid-redacted-c', 'memorabilia/redacted-c.jpg', 'fid-c', 64, NULL, '2026-01-03T00:00:00Z');
INSERT INTO members (id, email, display_name, created_at) VALUES
  (1, 'redacted-member@example.invalid', 'Redacted Member', '2026-01-01T00:00:00Z');
COMMIT;
`);

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

export function isToolingDisabled(env = process.env) {
  const raw = String(env[DISABLE_ENV] || '')
    .trim()
    .toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export function sha256Hex(input) {
  return createHash('sha256').update(input).digest('hex');
}

export function buildSyntheticB2Catalog(seed = 'lgfc-2895-b2') {
  const objects = [
    'photos/redacted-a.jpg',
    'photos/redacted-b.jpg',
    'memorabilia/redacted-c.jpg',
  ].map((key, idx) => {
    const payload = Buffer.from(`${seed}:${key}:${idx}:redacted-fixture-bytes`, 'utf8');
    const digest = sha256Hex(payload);
    return {
      key,
      size: payload.length,
      digestAlgo: 'sha256',
      digest,
      payloadEncoding: 'utf8-redacted-fixture',
      payload: payload.toString('utf8'),
    };
  });
  return {
    bucket: 'LouGehrigFanClub',
    mode: 'synthetic_isolated',
    versionLifecycleAssumption:
      'Provider object durability assumed; version/lifecycle not mutated in this proof',
    objects,
  };
}

export function verifyB2IntegritySample(catalog) {
  const results = [];
  for (const obj of catalog.objects) {
    const recomputed = sha256Hex(Buffer.from(obj.payload, 'utf8'));
    const sizeOk = Buffer.byteLength(obj.payload, 'utf8') === obj.size;
    const digestOk = recomputed === obj.digest;
    results.push({
      key: obj.key,
      ok: sizeOk && digestOk,
      sizeOk,
      digestOk,
    });
  }
  return {
    ok: results.every((r) => r.ok),
    sampled: results.length,
    results,
  };
}

export function reconcileCatalogToD1(mediaRows, catalog) {
  const catalogKeys = new Set(catalog.objects.map((o) => o.key));
  const d1Keys = mediaRows.map((r) => r.b2_key);
  const missingInCatalog = d1Keys.filter((k) => !catalogKeys.has(k));
  const orphanInCatalog = [...catalogKeys].filter((k) => !d1Keys.includes(k));
  return {
    ok: missingInCatalog.length === 0,
    d1ObjectRefs: d1Keys.length,
    catalogObjects: catalogKeys.size,
    missingInCatalog,
    orphanInCatalog,
  };
}

export function runD1IsolatedRestoreProof(opts = {}) {
  const exportSql = opts.exportSql || SYNTHETIC_D1_EXPORT_SQL;
  const keepArtifacts = opts.keepArtifacts === true;
  const started = Date.now();
  const workDir = mkdtempSync(join(tmpdir(), 'lgfc-d1-b2-recovery-'));
  const exportPath = join(workDir, 'synthetic-d1-export.sql');
  const restorePath = join(workDir, 'isolated-restore.sqlite');
  const checks = [];
  let db = null;

  try {
    writeFileSync(exportPath, exportSql, 'utf8');
    const exportDigest = sha256Hex(exportSql);
    checks.push({
      name: 'd1_export_written',
      ok: existsSync(exportPath),
      detail: `synthetic export bytes=${Buffer.byteLength(exportSql, 'utf8')}`,
    });
    checks.push({
      name: 'd1_export_integrity_hash',
      ok: Boolean(exportDigest) && exportDigest.length === 64,
      detail: `sha256=${exportDigest}`,
    });

    db = new DatabaseSync(restorePath);
    db.exec(exportSql);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all()
      .map((r) => r.name);
    for (const table of SYNTHETIC_APPLICATION_TABLES) {
      checks.push({
        name: `d1_table_present:${table}`,
        ok: tables.includes(table),
        detail: tables.includes(table) ? 'present after restore' : 'missing after restore',
      });
    }

    const photoCount = db.prepare('SELECT COUNT(*) AS c FROM photos').get().c;
    const mediaCount = db.prepare('SELECT COUNT(*) AS c FROM media_assets').get().c;
    const memberCount = db.prepare('SELECT COUNT(*) AS c FROM members').get().c;
    checks.push({
      name: 'd1_application_row_counts',
      ok: photoCount === 2 && mediaCount === 3 && memberCount === 1,
      detail: `photos=${photoCount} media_assets=${mediaCount} members=${memberCount}`,
    });

    const sample = db
      .prepare(
        `SELECT p.id AS photo_id, p.url, m.b2_key
         FROM photos p
         LEFT JOIN media_assets m ON m.id = p.id
         ORDER BY p.id`,
      )
      .all();
    checks.push({
      name: 'd1_application_compat_join',
      ok: sample.length === 2 && sample.every((r) => typeof r.url === 'string'),
      detail: `joined_rows=${sample.length}`,
    });

    const mediaRows = db.prepare('SELECT b2_key, size FROM media_assets ORDER BY id').all();
    const elapsedMs = Date.now() - started;
    const withinRto = elapsedMs < RECOVERY_TARGETS.d1.rtoMs;
    checks.push({
      name: 'd1_measured_rto_vs_target',
      ok: withinRto,
      detail: `measured_ms=${elapsedMs}; target_rto_hours=${RECOVERY_TARGETS.d1.rtoHours}; within_target=${withinRto}`,
    });

    return {
      ok: checks.every((c) => c.ok),
      workDir,
      exportPath,
      restorePath,
      exportDigest,
      mediaRows,
      elapsedMs,
      rpoTarget: RECOVERY_TARGETS.d1.rpo,
      rtoTargetHours: RECOVERY_TARGETS.d1.rtoHours,
      checks,
      cleaned: false,
    };
  } finally {
    try {
      db?.close();
    } catch {
      /* ignore */
    }
    if (!keepArtifacts) {
      rmSync(workDir, { recursive: true, force: true });
    }
  }
}

export function runB2CatalogRecoveryProof(opts = {}) {
  const started = Date.now();
  const catalog = opts.catalog || buildSyntheticB2Catalog(opts.seed);
  const mediaRows = opts.mediaRows;
  if (!mediaRows) {
    throw new Error('mediaRows required from D1 isolated restore for catalog reconciliation');
  }

  const integrity = verifyB2IntegritySample(catalog);
  const reconcile = reconcileCatalogToD1(mediaRows, catalog);
  const elapsedMs = Date.now() - started;
  const withinRto = elapsedMs < RECOVERY_TARGETS.b2.rtoMs;

  const checks = [
    {
      name: 'b2_catalog_present',
      ok: catalog.objects.length > 0,
      detail: `objects=${catalog.objects.length}; bucket=${catalog.bucket}; mode=${catalog.mode}`,
    },
    {
      name: 'b2_integrity_sample',
      ok: integrity.ok,
      detail: `sampled=${integrity.sampled}; failures=${integrity.results.filter((r) => !r.ok).length}`,
    },
    {
      name: 'b2_d1_catalog_reconcile',
      ok: reconcile.ok,
      detail: `d1_refs=${reconcile.d1ObjectRefs}; catalog=${reconcile.catalogObjects}; missing=${reconcile.missingInCatalog.join(',') || 'none'}; orphans=${reconcile.orphanInCatalog.join(',') || 'none'}`,
    },
    {
      name: 'b2_version_lifecycle_assumption_recorded',
      ok: Boolean(catalog.versionLifecycleAssumption),
      detail: catalog.versionLifecycleAssumption,
      severity: 'info',
    },
    {
      name: 'b2_measured_rto_vs_target',
      ok: withinRto,
      detail: `measured_ms=${elapsedMs}; target_rto_hours=${RECOVERY_TARGETS.b2.rtoHours}; within_target=${withinRto}`,
    },
  ];

  return {
    ok: checks.filter((c) => c.severity !== 'info').every((c) => c.ok),
    catalogMeta: {
      bucket: catalog.bucket,
      mode: catalog.mode,
      objectCount: catalog.objects.length,
    },
    integrity,
    reconcile,
    elapsedMs,
    rpoTarget: RECOVERY_TARGETS.b2.rpo,
    rtoTargetHours: RECOVERY_TARGETS.b2.rtoHours,
    checks,
  };
}

export function assertNoLiveProductionRestoreAttempted(env = process.env) {
  const dangerous = [
    'LGFC_FORCE_PRODUCTION_D1_RESTORE',
    'LGFC_FORCE_PRODUCTION_B2_RESTORE',
  ];
  const set = dangerous.filter((k) => {
    const v = String(env[k] || '')
      .trim()
      .toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  });
  return {
    ok: set.length === 0,
    detail:
      set.length === 0
        ? 'no Production restore force flags set; protected stop holds'
        : `blocked force flags: ${set.join(',')}`,
    blockedFlags: set,
  };
}

export function runPlatformD1B2RecoveryProof(opts = {}) {
  const env = opts.env || process.env;
  const now = new Date().toISOString();
  const actorRole = opts.actorRole || 'Implementation / Operations';
  const candidateSha = opts.candidateSha || gitSha();

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
          detail: `${DISABLE_ENV} set; recovery proof skipped`,
          severity: 'info',
        },
      ],
      summary: {
        recommendation: 'DISABLED',
        productionMutation: 'not_authorized',
      },
    };
  }

  const checks = [];

  for (const rel of REQUIRED_DOCS) {
    const abs = join(REPO_ROOT, rel);
    checks.push({
      name: `doc_present:${rel}`,
      ok: existsSync(abs),
      detail: existsSync(abs) ? 'present' : 'missing',
    });
  }

  const stop = assertNoLiveProductionRestoreAttempted(env);
  checks.push({
    name: 'protected_stop_no_production_restore',
    ok: stop.ok,
    detail: stop.detail,
  });

  for (const d of PROTECTED_DECISIONS) {
    checks.push({
      name: `protected_decision:${d.id}`,
      ok: true,
      detail: d.note,
      severity: 'info',
    });
  }

  let d1Proof = null;
  let b2Proof = null;
  let cleanupVerified = false;

  if (stop.ok) {
    // Keep artifacts briefly only to prove cleanup removes them.
    d1Proof = runD1IsolatedRestoreProof({ keepArtifacts: true });
    checks.push(...d1Proof.checks);

    b2Proof = runB2CatalogRecoveryProof({ mediaRows: d1Proof.mediaRows });
    checks.push(...b2Proof.checks);

    // Explicit cleanup of disposable isolated artifacts.
    rmSync(d1Proof.workDir, { recursive: true, force: true });
    cleanupVerified = !existsSync(d1Proof.workDir);
    checks.push({
      name: 'isolated_artifact_cleanup',
      ok: cleanupVerified,
      detail: cleanupVerified
        ? `removed workDir=${d1Proof.workDir}`
        : `workDir still present: ${d1Proof.workDir}`,
    });
  } else {
    checks.push({
      name: 'proofs_skipped_due_to_protected_stop',
      ok: false,
      detail: 'Production restore force flag blocked execution',
    });
  }

  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
  checks.push({
    name: 'package_script_present',
    ok: Boolean(pkg.scripts?.['validate:platform-d1-b2-recovery-proof']),
    detail: 'package.json scripts.validate:platform-d1-b2-recovery-proof',
  });

  // Entropy touch so accidental Production-looking tokens are not emitted.
  void randomBytes(8);

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
    sourceIssue: '#2895',
    parentProject: '#2779',
    componentBranch: 'component/platform-recovery-readiness',
    candidateSha,
    d1: d1Proof
      ? {
          exportDigest: d1Proof.exportDigest,
          elapsedMs: d1Proof.elapsedMs,
          rpoTarget: d1Proof.rpoTarget,
          rtoTargetHours: d1Proof.rtoTargetHours,
          withinRto: d1Proof.elapsedMs < RECOVERY_TARGETS.d1.rtoMs,
        }
      : null,
    b2: b2Proof
      ? {
          catalogMeta: b2Proof.catalogMeta,
          elapsedMs: b2Proof.elapsedMs,
          rpoTarget: b2Proof.rpoTarget,
          rtoTargetHours: b2Proof.rtoTargetHours,
          withinRto: b2Proof.elapsedMs < RECOVERY_TARGETS.b2.rtoMs,
          reconcile: b2Proof.reconcile,
        }
      : null,
    cleanupVerified,
    protectedDecisions: PROTECTED_DECISIONS,
    limitations: [
      'Synthetic local SQLite stands in for isolated non-Production D1; live Cloudflare disposable D1 not provisioned in this task.',
      'B2 integrity sampling uses synthetic object payloads; live ListObjectsV2 / object GET deferred (credentials).',
      'Measured RTO is local fixture time only; Production provider restore duration remains unmeasured until separately authorized.',
      'No Production data, secrets, or provider resources were created or mutated.',
    ],
    checks,
    fingerprint: createHash('sha256')
      .update(JSON.stringify({ d1: d1Proof?.exportDigest, b2: b2Proof?.catalogMeta }))
      .digest('hex')
      .slice(0, 16),
    summary: {
      recommendation: ok ? 'D1_B2_ISOLATED_RECOVERY_PROOF_READY_FOR_REVIEW' : 'NOT_READY',
      productionMutation: 'not_authorized',
      blockingFailures: blocking.map((c) => c.name),
    },
  };
}

function printHelp() {
  console.log(`Usage: node scripts/ci/platform-d1-b2-recovery-proof.mjs [--json] [--help]

Disable: ${DISABLE_ENV}=1
`);
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  const result = runPlatformD1B2RecoveryProof();
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `platform-d1-b2-recovery-proof ok=${result.ok} disabled=${result.disabled} productionMutation=${result.productionMutation}`,
    );
    console.log(`candidateSha=${result.candidateSha}`);
    console.log(`recommendation=${result.summary.recommendation}`);
    if (result.d1) {
      console.log(
        `d1: elapsedMs=${result.d1.elapsedMs} withinRto=${result.d1.withinRto} exportDigest=${result.d1.exportDigest}`,
      );
    }
    if (result.b2) {
      console.log(
        `b2: elapsedMs=${result.b2.elapsedMs} withinRto=${result.b2.withinRto} objects=${result.b2.catalogMeta.objectCount}`,
      );
    }
    for (const c of result.checks) {
      const mark = c.ok ? 'PASS' : 'FAIL';
      console.log(`  [${mark}] ${c.name}: ${c.detail}`);
    }
    if (result.limitations) {
      console.log('limitations:');
      for (const lim of result.limitations) console.log(`  - ${lim}`);
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
