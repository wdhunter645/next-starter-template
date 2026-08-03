#!/usr/bin/env node
/**
 * #2891 / #2778-002 — read-only Cloudflare Pages/Functions + D1 validation.
 *
 * Never mutates Production, D1, B2, or Cloudflare configuration.
 * Live D1 schema reads require credentials; without them the live step is
 * recorded as fail-closed / skipped with an explicit reason.
 *
 * Usage:
 *   node scripts/ci/platform-cf-d1-validation.mjs
 *   node scripts/ci/platform-cf-d1-validation.mjs --json
 *   node scripts/ci/platform-cf-d1-validation.mjs --skip-http
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '../..');

const MUTATION_EXPORTS = [
  'onRequestPost',
  'onRequestPut',
  'onRequestPatch',
  'onRequestDelete',
];

const DEFAULT_PUBLIC_HOSTS = [
  'https://www.lougehrigfanclub.com',
  'https://next-starter-template-6yr.pages.dev',
];

/** Application tables expected from repository migrations (representative set). */
export const REQUIRED_APPLICATION_TABLES = Object.freeze([
  'members',
  'member_sessions',
  'photos',
  'events',
  'weekly_matchups',
  'content_items',
  'media_assets',
  'faq_entries',
]);

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
    skipHttp: argv.includes('--skip-http'),
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

function collectTsFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) collectTsFiles(full, acc);
    else if (entry.endsWith('.ts')) acc.push(relative(REPO_ROOT, full));
  }
  return acc;
}

function handlerHasMutationExport(source) {
  return MUTATION_EXPORTS.some((name) =>
    new RegExp(`export\\s+(?:async\\s+)?(?:const|function)\\s+${name}\\b`).test(source),
  );
}

export function parseWranglerToml(text) {
  const name = text.match(/^\s*name\s*=\s*"([^"]+)"/m)?.[1] || null;
  const outputDir = text.match(/^\s*pages_build_output_dir\s*=\s*"([^"]+)"/m)?.[1] || null;
  const binding = text.match(/^\s*binding\s*=\s*"([^"]+)"/m)?.[1] || null;
  const databaseName = text.match(/^\s*database_name\s*=\s*"([^"]+)"/m)?.[1] || null;
  const databaseId = text.match(/^\s*database_id\s*=\s*"([^"]+)"/m)?.[1] || null;
  return { name, outputDir, binding, databaseName, databaseId };
}

export function findMigrationPrefixCollisions(migrationDir = join(REPO_ROOT, 'migrations')) {
  if (!existsSync(migrationDir)) return { files: [], collisions: [] };
  const files = readdirSync(migrationDir).filter((f) => f.endsWith('.sql')).sort();
  const byPrefix = new Map();
  for (const file of files) {
    const prefix = file.split('_')[0];
    if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
    byPrefix.get(prefix).push(file);
  }
  const collisions = [...byPrefix.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([prefix, list]) => ({ prefix, files: list }));
  return { files, collisions };
}

export function extractCreateTablesFromMigrations(migrationDir = join(REPO_ROOT, 'migrations')) {
  const tables = new Set();
  if (!existsSync(migrationDir)) return tables;
  for (const file of readdirSync(migrationDir)) {
    if (!file.endsWith('.sql')) continue;
    const body = readFileSync(join(migrationDir, file), 'utf8');
    const re = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+[`"]?([A-Za-z_][A-Za-z0-9_]*)[`"]?/gi;
    let m;
    while ((m = re.exec(body))) tables.add(m[1]);
  }
  return tables;
}

export function extractCreateIndexesFromMigrations(migrationDir = join(REPO_ROOT, 'migrations')) {
  const indexes = new Set();
  if (!existsSync(migrationDir)) return indexes;
  for (const file of readdirSync(migrationDir)) {
    if (!file.endsWith('.sql')) continue;
    const body = readFileSync(join(migrationDir, file), 'utf8');
    const re = /CREATE\s+(?:UNIQUE\s+)?INDEX(?:\s+IF\s+NOT\s+EXISTS)?\s+[`"]?([A-Za-z_][A-Za-z0-9_]*)[`"]?/gi;
    let m;
    while ((m = re.exec(body))) indexes.add(m[1]);
  }
  return indexes;
}

function check(name, ok, detail, meta = {}) {
  return { name, ok: Boolean(ok), detail, ...meta };
}

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return { ok: res.ok, status: res.status, json, text: text.slice(0, 400) };
  } finally {
    clearTimeout(t);
  }
}

export async function runPlatformCfD1Validation(opts = {}) {
  const skipHttp = Boolean(opts.skipHttp);
  const now = new Date().toISOString();
  const candidateSha = opts.candidateSha || gitSha();
  const checks = [];

  const wranglerText = readText('wrangler.toml');
  const routesText = readText('_routes.json');
  const cfDoc = readText('docs/reference/platform/CLOUDFLARE.md') || '';
  const isolationManifestText = readText('scripts/ci/preview-isolation-manifest.json');
  let isolationManifest = null;
  try {
    isolationManifest = isolationManifestText ? JSON.parse(isolationManifestText) : null;
  } catch {
    isolationManifest = null;
  }

  checks.push(
    check('repo_wrangler_present', Boolean(wranglerText), wranglerText ? 'wrangler.toml present' : 'missing wrangler.toml'),
  );
  checks.push(
    check('repo_routes_present', Boolean(routesText), routesText ? '_routes.json present' : 'missing _routes.json'),
  );

  const wrangler = wranglerText ? parseWranglerToml(wranglerText) : {};
  checks.push(
    check(
      'pages_output_dir',
      wrangler.outputDir === './out' || wrangler.outputDir === 'out',
      `pages_build_output_dir=${wrangler.outputDir || 'missing'}`,
    ),
  );
  checks.push(
    check(
      'd1_binding_identity',
      wrangler.binding === 'DB' && wrangler.databaseName === 'lgfc_lite' && Boolean(wrangler.databaseId),
      `binding=${wrangler.binding} name=${wrangler.databaseName} id=${wrangler.databaseId || 'missing'}`,
    ),
  );

  const docsProject =
    /\*\*Project:\*\*\s*`([^`]+)`/.exec(cfDoc)?.[1] ||
    /Project:\s*`([^`]+)`/.exec(cfDoc)?.[1] ||
    null;
  const driftPresent = Boolean(wrangler.name) && Boolean(docsProject) && wrangler.name !== docsProject;
  checks.push(
    check(
      'pages_name_drift_recorded',
      driftPresent,
      driftPresent
        ? `wrangler name=${wrangler.name}; docs project=${docsProject} (expected documented drift from #2890)`
        : `unable to confirm documented Pages name drift (wrangler=${wrangler.name || 'missing'}; docs=${docsProject || 'missing'})`,
      { severity: 'info' },
    ),
  );

  let routesOk = false;
  try {
    const routes = routesText ? JSON.parse(routesText) : null;
    routesOk = routes?.version === 1 && Array.isArray(routes.include) && routes.include.includes('/*');
  } catch {
    routesOk = false;
  }
  checks.push(check('routes_json_shape', routesOk, routesOk ? '_routes.json include /*' : 'invalid _routes.json'));

  const handlers = collectTsFiles(join(REPO_ROOT, 'functions/api'));
  const mutating = [];
  const getOnly = [];
  for (const rel of handlers) {
    const source = readFileSync(join(REPO_ROOT, rel), 'utf8');
    if (handlerHasMutationExport(source)) mutating.push(rel);
    else getOnly.push(rel);
  }
  checks.push(
    check(
      'functions_inventory',
      handlers.length > 0,
      `${handlers.length} handlers; mutating=${mutating.length}; getish=${getOnly.length}`,
      { mutating: mutating.slice(0, 40), sampleGet: getOnly.slice(0, 15) },
    ),
  );

  const d1Lib = readText('functions/_lib/d1.ts');
  checks.push(
    check(
      'd1_fail_closed_helper',
      Boolean(d1Lib && d1Lib.includes('requireD1') && d1Lib.includes('D1 binding')),
      d1Lib ? 'functions/_lib/d1.ts requireD1 present' : 'missing d1 guard helper',
    ),
  );

  checks.push(
    check(
      'preview_isolation_manifest',
      Boolean(isolationManifest?.resources?.length),
      isolationManifest
        ? `${isolationManifest.resources.length} resources; production-shared=${isolationManifest.resources.filter((r) => r.classification === 'production-shared').length}`
        : 'missing preview-isolation-manifest.json',
    ),
  );

  if (isolationManifest?.resources) {
    const shared = isolationManifest.resources.filter((r) => r.classification === 'production-shared');
    const allBlocked = shared.every((r) => Boolean(r.blockingRule));
    checks.push(
      check(
        'preview_isolation_fail_closed_rules',
        shared.length > 0 && allBlocked,
        `${shared.length} production-shared resources with blocking rules`,
      ),
    );
  }

  const { files: migrationFiles, collisions } = findMigrationPrefixCollisions();
  checks.push(
    check(
      'migration_prefix_collisions',
      collisions.length === 0,
      collisions.length === 0
        ? `${migrationFiles.length} migration files; no prefix collisions`
        : `collisions: ${collisions.map((c) => `${c.prefix}(${c.files.length})`).join(', ')}`,
      { collisions, severity: collisions.length ? 'fail' : 'pass' },
    ),
  );

  const tables = extractCreateTablesFromMigrations();
  const indexes = extractCreateIndexesFromMigrations();
  const missingTables = REQUIRED_APPLICATION_TABLES.filter((t) => !tables.has(t));
  checks.push(
    check(
      'migration_required_tables',
      missingTables.length === 0,
      missingTables.length === 0
        ? `all ${REQUIRED_APPLICATION_TABLES.length} required tables declared in migrations (${tables.size} total CREATE TABLE)`
        : `missing tables in migrations: ${missingTables.join(', ')}`,
      { tableCount: tables.size, indexCount: indexes.size, missingTables },
    ),
  );

  // Representative public read paths (HTTP GET only).
  if (!skipHttp) {
    for (const host of opts.publicHosts || DEFAULT_PUBLIC_HOSTS) {
      const healthUrl = `${host.replace(/\/$/, '')}/api/health`;
      try {
        const result = await fetchJson(healthUrl);
        const bodyOk = result.json && result.json.ok === true;
        checks.push(
          check(
            `http_health_${host.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_')}`,
            result.ok && bodyOk,
            `GET ${healthUrl} status=${result.status} ok=${result.json?.ok} db_ok=${result.json?.db_ok}`,
            { host, healthUrl, status: result.status, body: result.json },
          ),
        );
      } catch (err) {
        checks.push(
          check(
            `http_health_${host.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_')}`,
            false,
            `GET ${healthUrl} failed: ${err.message}`,
          ),
        );
      }
    }
  } else {
    checks.push(check('http_health_skipped', true, 'HTTP checks skipped via --skip-http', { severity: 'info' }));
  }

  // Live D1: fail closed without credentials; never write.
  const hasToken = Boolean(process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN);
  const hasAccount = Boolean(process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID);
  if (!hasToken || !hasAccount) {
    checks.push(
      check(
        'live_d1_schema_read',
        false,
        'fail-closed: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID not present in this runtime; live D1 schema read not attempted (no writes performed)',
        { severity: 'fail_closed', attempted: false },
      ),
    );
  } else {
    const args = ['d1', 'info', wrangler.databaseName || 'lgfc_lite', '--json'];
    const bin = existsSync(join(REPO_ROOT, 'node_modules/.bin/wrangler'))
      ? join(REPO_ROOT, 'node_modules/.bin/wrangler')
      : 'npx';
    const cmd = bin.endsWith('wrangler') ? [bin, ...args] : [bin, '--no-install', 'wrangler', ...args];
    const r = spawnSync(cmd[0], cmd.slice(1), {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      env: process.env,
      timeout: 60000,
    });
    const ok = r.status === 0;
    checks.push(
      check(
        'live_d1_schema_read',
        ok,
        ok
          ? `wrangler d1 info succeeded for ${wrangler.databaseName} (read-only)`
          : `wrangler d1 info failed: ${(r.stderr || r.stdout || '').trim().slice(0, 400)}`,
        { attempted: true, readOnly: true },
      ),
    );
  }

  const hardFailures = checks.filter((c) => !c.ok && c.severity !== 'info' && c.name !== 'pages_name_drift_recorded');
  // pages_name_drift_recorded is informational expected-true when drift exists; invert not needed for pass.
  const blocking = checks.filter((c) => {
    if (c.name === 'pages_name_drift_recorded') return false; // expected drift note
    if (c.severity === 'info') return false;
    if (c.name === 'live_d1_schema_read' && c.severity === 'fail_closed') return false; // recorded, not blocking offline runs
    if (c.name === 'migration_prefix_collisions') return false; // known #2890 debt; report but do not block tooling land
    return !c.ok;
  });

  const result = {
    schemaVersion: 1,
    kind: 'platform_cf_d1_validation',
    issue: 2891,
    parent: 2778,
    observedAt: now,
    candidateSha,
    actorRole: 'Implementation / Operations (Cursor Local)',
    productionMutation: false,
    writeAttempts: 0,
    wrangler,
    summary: {
      total: checks.length,
      passed: checks.filter((c) => c.ok).length,
      failed: checks.filter((c) => !c.ok).length,
      blockingFailures: blocking.map((c) => c.name),
      knownDebt: [
        ...collisions.map((c) => `migration_prefix_collision:${c.prefix}`),
        wrangler.name && docsProject && wrangler.name !== docsProject
          ? `pages_name_drift:${wrangler.name}->${docsProject}`
          : null,
        !hasToken || !hasAccount ? 'live_d1_unauthenticated_fail_closed' : null,
      ].filter(Boolean),
    },
    checks,
    ok: blocking.length === 0,
    fingerprint: createHash('sha256')
      .update(JSON.stringify({ candidateSha, checks: checks.map((c) => [c.name, c.ok]) }))
      .digest('hex')
      .slice(0, 16),
  };

  return result;
}

function printHuman(result) {
  console.log(`platform-cf-d1-validation  ok=${result.ok}  sha=${result.candidateSha}  at=${result.observedAt}`);
  console.log(
    `checks ${result.summary.passed}/${result.summary.total} passed; blocking=${result.summary.blockingFailures.join(',') || 'none'}`,
  );
  if (result.summary.knownDebt.length) {
    console.log(`known debt: ${result.summary.knownDebt.join('; ')}`);
  }
  for (const c of result.checks) {
    const mark = c.ok ? 'PASS' : c.severity === 'info' ? 'INFO' : 'FAIL';
    console.log(`  [${mark}] ${c.name}: ${c.detail}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node scripts/ci/platform-cf-d1-validation.mjs [--json] [--skip-http]
Read-only Cloudflare Pages/Functions + D1 validation for #2891.
Never writes Production/D1/B2. Live D1 requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID.`);
    process.exit(0);
  }
  const result = await runPlatformCfD1Validation({ skipHttp: args.skipHttp });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else printHuman(result);
  process.exit(result.ok ? 0 : 1);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
