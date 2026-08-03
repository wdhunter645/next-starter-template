#!/usr/bin/env node
/**
 * #2892 / #2778-003 — read-only B2 + integrated runtime validation.
 *
 * Never mutates Production, D1, B2, or Cloudflare configuration.
 * Never logs or embeds secret values. Live B2 ListObjects requires
 * credentials; without them the live step is fail-closed / skipped.
 *
 * Usage:
 *   node scripts/ci/platform-b2-runtime-validation.mjs
 *   node scripts/ci/platform-b2-runtime-validation.mjs --json
 *   node scripts/ci/platform-b2-runtime-validation.mjs --skip-http
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '../..');

const EXPECTED_B2_ENV_NAMES = Object.freeze([
  'B2_KEY_ID',
  'B2_APP_KEY',
  'B2_BUCKET',
  'B2_ENDPOINT',
  'PUBLIC_B2_BASE_URL',
]);

/** Inventory facts from docs/reference/platform/Backblaze_B2.md (names only). */
export const EXPECTED_B2_INVENTORY = Object.freeze({
  bucket: 'LouGehrigFanClub',
  endpointHost: 's3.us-east-005.backblazeb2.com',
});

/** Representative public read APIs that surface B2-backed media or health. */
export const INTEGRATED_PUBLIC_READ_PATHS = Object.freeze([
  '/api/health',
  '/api/photos/list',
  '/api/friends/list',
  '/api/milestones/list',
  '/api/matchup/results',
]);

const MEDIA_NORMALIZE_FILES = Object.freeze([
  'functions/api/friends/list.ts',
  'functions/api/milestones/list.ts',
  'functions/api/photos/list.ts',
  'functions/api/photos/get.ts',
]);

const SYNC_SCRIPT_PATHS = Object.freeze([
  'scripts/b2_d1_incremental_sync.sh',
  'scripts/b2_d1_deletion_reconcile.sh',
  'scripts/B2_D1_SYNC_README.md',
  '.github/workflows/b2-d1-daily-sync.yml',
  'functions/api/admin/media-assets/sync-from-b2.ts',
]);

const MUTATION_METHOD_RE =
  /\b(PutObject|DeleteObject|UploadPart|CreateMultipartUpload|DeleteObjects|putObject|deleteObject)\b/;

const DEFAULT_PUBLIC_HOSTS = [
  'https://www.lougehrigfanclub.com',
  'https://next-starter-template-6yr.pages.dev',
];

const SECRET_ENV_KEYS = Object.freeze([
  'B2_KEY_ID',
  'B2_APP_KEY',
  'B2_APPLICATION_KEY',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ACCESS_KEY_ID',
  'ADMIN_TOKEN',
  'CLOUDFLARE_API_TOKEN',
  'CF_API_TOKEN',
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

function collectFiles(dir, pred, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) collectFiles(full, pred, acc);
    else if (pred(entry, full)) acc.push(relative(REPO_ROOT, full));
  }
  return acc;
}

function check(name, ok, detail, meta = {}) {
  return { name, ok: Boolean(ok), detail, ...meta };
}

/** Redact known credential env values from operator-facing text. */
export function redactSecrets(text, env = process.env) {
  let out = String(text ?? '');
  for (const key of SECRET_ENV_KEYS) {
    const value = env[key];
    if (value && String(value).length >= 4) {
      out = out.split(String(value)).join(`[REDACTED:${key}]`);
    }
  }
  return out;
}

export function parseB2DocInventory(docText) {
  const bucket =
    docText.match(/^\s*-\s*Name:\s*`?([A-Za-z0-9._-]+)`?/m)?.[1] ||
    docText.match(/Bucket[\s\S]*?Name:\s*`?([A-Za-z0-9._-]+)`?/i)?.[1] ||
    null;
  const endpointHost =
    docText.match(/S3-compatible endpoint:\s*`?([a-z0-9.-]+)`?/i)?.[1] ||
    docText.match(/\b(s3\.[a-z0-9.-]+\.backblazeb2\.com)\b/i)?.[1] ||
    null;
  const envNames = EXPECTED_B2_ENV_NAMES.filter((name) => docText.includes(name));
  const corsMentioned = /CORS/i.test(docText);
  return { bucket, endpointHost, envNames, corsMentioned };
}

export function scanRuntimeForB2Mutations(functionsRoot = join(REPO_ROOT, 'functions')) {
  const files = collectFiles(functionsRoot, (name) => name.endsWith('.ts') || name.endsWith('.js'));
  const offenders = [];
  for (const rel of files) {
    const body = readFileSync(join(REPO_ROOT, rel), 'utf8');
    if (MUTATION_METHOD_RE.test(body)) offenders.push(rel);
  }
  return { filesScanned: files.length, offenders };
}

export function hasB2Credentials(env = process.env) {
  return Boolean(
    String(env.B2_KEY_ID || '').trim() &&
      String(env.B2_APP_KEY || '').trim() &&
      String(env.B2_ENDPOINT || '').trim() &&
      String(env.B2_BUCKET || '').trim(),
  );
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

async function fetchHeadOrOptions(url, method, timeoutMs = 12000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers:
        method === 'OPTIONS'
          ? {
              Origin: 'https://www.lougehrigfanclub.com',
              'Access-Control-Request-Method': 'GET',
            }
          : undefined,
      redirect: 'follow',
    });
    const headers = {};
    for (const name of [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'content-type',
      'x-bz-file-id',
      'etag',
    ]) {
      const v = res.headers.get(name);
      if (v) headers[name] = v;
    }
    return { ok: res.ok || res.status === 204 || res.status === 403 || res.status === 405, status: res.status, headers };
  } finally {
    clearTimeout(t);
  }
}

function liveB2ListViaAwsCli(env = process.env) {
  const endpoint = String(env.B2_ENDPOINT || '').trim().replace(/\/$/, '');
  const bucket = String(env.B2_BUCKET || '').trim();
  const aws = spawnSync(
    'aws',
    [
      's3api',
      'list-objects-v2',
      '--bucket',
      bucket,
      '--max-keys',
      '1',
      '--endpoint-url',
      endpoint,
      '--output',
      'json',
    ],
    {
      encoding: 'utf8',
      env: {
        ...env,
        AWS_ACCESS_KEY_ID: env.B2_KEY_ID,
        AWS_SECRET_ACCESS_KEY: env.B2_APP_KEY,
        AWS_EC2_METADATA_DISABLED: 'true',
      },
      timeout: 60000,
    },
  );
  return {
    status: aws.status,
    stdout: redactSecrets(aws.stdout || '', env),
    stderr: redactSecrets(aws.stderr || '', env),
  };
}

export async function runPlatformB2RuntimeValidation(opts = {}) {
  const skipHttp = Boolean(opts.skipHttp);
  const now = new Date().toISOString();
  const candidateSha = opts.candidateSha || gitSha();
  const env = opts.env || process.env;
  const checks = [];

  const b2Doc = readText('docs/reference/platform/Backblaze_B2.md') || '';
  const envExample = readText('.env.example') || '';
  const b2Lib = readText('functions/_lib/b2.ts') || '';
  const syncHandler = readText('functions/api/admin/media-assets/sync-from-b2.ts') || '';
  const isolationManifestText = readText('scripts/ci/preview-isolation-manifest.json');
  let isolationManifest = null;
  try {
    isolationManifest = isolationManifestText ? JSON.parse(isolationManifestText) : null;
  } catch {
    isolationManifest = null;
  }

  checks.push(
    check('repo_b2_doc_present', Boolean(b2Doc), b2Doc ? 'Backblaze_B2.md present' : 'missing Backblaze_B2.md'),
  );

  const inventory = parseB2DocInventory(b2Doc);
  checks.push(
    check(
      'b2_bucket_metadata',
      inventory.bucket === EXPECTED_B2_INVENTORY.bucket &&
        inventory.endpointHost === EXPECTED_B2_INVENTORY.endpointHost,
      `bucket=${inventory.bucket || 'missing'}; endpoint=${inventory.endpointHost || 'missing'}`,
      { inventory },
    ),
  );

  const missingEnvDoc = EXPECTED_B2_ENV_NAMES.filter((n) => !inventory.envNames.includes(n));
  const missingEnvExample = EXPECTED_B2_ENV_NAMES.filter((n) => !envExample.includes(`${n}=`));
  checks.push(
    check(
      'b2_env_names_documented',
      missingEnvDoc.length === 0 && missingEnvExample.length === 0,
      missingEnvDoc.length === 0 && missingEnvExample.length === 0
        ? `all ${EXPECTED_B2_ENV_NAMES.length} B2 env names present in docs + .env.example (values not required)`
        : `missing doc=${missingEnvDoc.join(',') || 'none'}; missing .env.example=${missingEnvExample.join(',') || 'none'}`,
    ),
  );

  checks.push(
    check(
      'b2_cors_documented',
      inventory.corsMentioned,
      inventory.corsMentioned
        ? 'CORS section present in Backblaze_B2.md (rules may still need console finalization)'
        : 'CORS not mentioned in B2 inventory doc',
      { severity: 'info' },
    ),
  );

  checks.push(
    check(
      'b2_fail_closed_helper',
      Boolean(b2Lib.includes('requireB2') && b2Lib.includes('B2 secrets missing') && b2Lib.includes('listB2Objects')),
      b2Lib ? 'functions/_lib/b2.ts requireB2 + listB2Objects present' : 'missing b2 helper',
    ),
  );

  checks.push(
    check(
      'b2_runtime_list_only',
      Boolean(b2Lib.includes('ListObjectsV2') && !MUTATION_METHOD_RE.test(b2Lib)),
      'functions/_lib/b2.ts uses ListObjectsV2 only (no Put/Delete symbols)',
    ),
  );

  const mutationScan = scanRuntimeForB2Mutations();
  checks.push(
    check(
      'functions_no_b2_object_mutation',
      mutationScan.offenders.length === 0,
      mutationScan.offenders.length === 0
        ? `scanned ${mutationScan.filesScanned} function files; no PutObject/DeleteObject symbols`
        : `offenders: ${mutationScan.offenders.join(', ')}`,
      { offenders: mutationScan.offenders },
    ),
  );

  const syncOk =
    Boolean(syncHandler) &&
    syncHandler.includes('requireAdmin') &&
    syncHandler.includes('requireB2') &&
    syncHandler.includes('onRequestPost') &&
    /onRequestGet[\s\S]*405/.test(syncHandler) &&
    syncHandler.includes('INSERT OR IGNORE');
  checks.push(
    check(
      'admin_b2_sync_protected',
      syncOk,
      syncOk
        ? 'sync-from-b2 is POST-only, admin-gated, requireB2 fail-closed, INSERT OR IGNORE'
        : 'sync-from-b2 missing required protected-stop controls',
    ),
  );

  const missingSync = SYNC_SCRIPT_PATHS.filter((p) => !existsSync(join(REPO_ROOT, p)));
  checks.push(
    check(
      'b2_sync_tooling_present',
      missingSync.length === 0,
      missingSync.length === 0
        ? `${SYNC_SCRIPT_PATHS.length} sync/tooling paths present`
        : `missing: ${missingSync.join(', ')}`,
    ),
  );

  const missingNormalize = MEDIA_NORMALIZE_FILES.filter((p) => {
    const body = readText(p);
    return !body || !body.includes('normalizePhotoUrl');
  });
  checks.push(
    check(
      'media_read_paths_normalize_b2_urls',
      missingNormalize.length === 0,
      missingNormalize.length === 0
        ? `${MEDIA_NORMALIZE_FILES.length} media read paths normalize B2 URLs`
        : `missing normalizePhotoUrl: ${missingNormalize.join(', ')}`,
    ),
  );

  const b2Resources = (isolationManifest?.resources || []).filter((r) => r.category === 'b2' || String(r.id || '').startsWith('b2') || String(r.id || '').includes('b2'));
  const runtimeList = b2Resources.find((r) => r.id === 'b2-runtime-list');
  const syncResource = b2Resources.find((r) => r.id === 'b2-sync-from-b2');
  const ciSync = (isolationManifest?.resources || []).find((r) => r.id === 'ci-b2-d1-sync');
  const isolationOk =
    runtimeList?.classification === 'read-only' &&
    syncResource?.classification === 'production-shared' &&
    Boolean(syncResource?.blockingRule) &&
    Boolean(syncResource?.protected) &&
    ciSync?.classification === 'production-shared' &&
    Boolean(ciSync?.blockingRule);
  checks.push(
    check(
      'preview_isolation_b2_rules',
      isolationOk,
      isolationOk
        ? 'b2-runtime-list=read-only; b2-sync-from-b2 + ci-b2-d1-sync=production-shared with blocking rules'
        : 'B2 preview-isolation classifications incomplete or missing blocking rules',
      {
        runtimeList: runtimeList?.classification || null,
        syncResource: syncResource?.classification || null,
        ciSync: ciSync?.classification || null,
      },
    ),
  );

  // Preview must not gain Production writes through GET-accessible admin sync.
  checks.push(
    check(
      'preview_no_production_b2_write_via_get',
      Boolean(syncHandler && /onRequestGet[\s\S]*405/.test(syncHandler) && syncHandler.includes('requireAdmin')),
      'Admin B2 sync rejects GET (405) and requires ADMIN_TOKEN on POST — preview cannot write without mirrored secrets',
    ),
  );

  // Integrated runtime HTTP checks (GET only).
  if (!skipHttp) {
    for (const host of opts.publicHosts || DEFAULT_PUBLIC_HOSTS) {
      const hostKey = host.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_');
      for (const path of INTEGRATED_PUBLIC_READ_PATHS) {
        const url = `${host.replace(/\/$/, '')}${path}`;
        try {
          const result = await fetchJson(url);
          const bodyOk =
            path === '/api/health'
              ? result.json?.ok === true
              : result.status < 500;
          checks.push(
            check(
              `http_get_${hostKey}_${path.replace(/[^a-z0-9]+/gi, '_')}`,
              result.status > 0 && bodyOk,
              redactSecrets(
                `GET ${url} status=${result.status} ok=${result.json?.ok ?? 'n/a'}`,
                env,
              ),
              { host, path, status: result.status, severity: path === '/api/health' ? undefined : 'info' },
            ),
          );
        } catch (err) {
          checks.push(
            check(
              `http_get_${hostKey}_${path.replace(/[^a-z0-9]+/gi, '_')}`,
              false,
              redactSecrets(`GET ${url} failed: ${err.message}`, env),
              { severity: path === '/api/health' ? undefined : 'info' },
            ),
          );
        }
      }

      // Admin sync GET must not mutate; expect 401/403/405 without token.
      const syncUrl = `${host.replace(/\/$/, '')}/api/admin/media-assets/sync-from-b2`;
      try {
        const res = await fetch(syncUrl, { method: 'GET', headers: { Accept: 'application/json' } });
        const text = redactSecrets((await res.text()).slice(0, 200), env);
        const bounded = res.status === 401 || res.status === 403 || res.status === 405;
        checks.push(
          check(
            `http_admin_sync_get_bounded_${hostKey}`,
            bounded,
            `GET ${syncUrl} status=${res.status} body=${text}`,
            { severity: 'info' },
          ),
        );
      } catch (err) {
        checks.push(
          check(
            `http_admin_sync_get_bounded_${hostKey}`,
            false,
            redactSecrets(`GET ${syncUrl} failed: ${err.message}`, env),
            { severity: 'info' },
          ),
        );
      }
    }

    // Public bucket object probe + CORS OPTIONS (no credentials).
    const publicObjectBase = `https://${EXPECTED_B2_INVENTORY.endpointHost}/${EXPECTED_B2_INVENTORY.bucket}`;
    try {
      const head = await fetchHeadOrOptions(`${publicObjectBase}/`, 'HEAD');
      checks.push(
        check(
          'public_b2_endpoint_reachable',
          head.status > 0 && head.status < 500,
          `HEAD ${publicObjectBase}/ status=${head.status}`,
          { severity: 'info', headers: head.headers },
        ),
      );
    } catch (err) {
      checks.push(
        check(
          'public_b2_endpoint_reachable',
          false,
          `HEAD ${publicObjectBase}/ failed: ${err.message}`,
          { severity: 'info' },
        ),
      );
    }
    try {
      const opt = await fetchHeadOrOptions(`${publicObjectBase}/`, 'OPTIONS');
      const allowOrigin = opt.headers['access-control-allow-origin'];
      checks.push(
        check(
          'public_b2_cors_probe',
          opt.status > 0,
          allowOrigin
            ? `OPTIONS status=${opt.status}; Access-Control-Allow-Origin=${allowOrigin}`
            : `OPTIONS status=${opt.status}; no Access-Control-Allow-Origin (bucket public GET may still work same-origin or via CDN)`,
          { severity: 'info', headers: opt.headers },
        ),
      );
    } catch (err) {
      checks.push(
        check(
          'public_b2_cors_probe',
          false,
          `OPTIONS failed: ${err.message}`,
          { severity: 'info' },
        ),
      );
    }
  } else {
    checks.push(check('http_integrated_skipped', true, 'HTTP checks skipped via --skip-http', { severity: 'info' }));
  }

  // Live credentialed ListObjectsV2: fail closed without secrets; never write.
  if (!hasB2Credentials(env)) {
    checks.push(
      check(
        'live_b2_list_read',
        false,
        'fail-closed: B2_KEY_ID/B2_APP_KEY/B2_ENDPOINT/B2_BUCKET not present in this runtime; live ListObjectsV2 not attempted (no writes performed)',
        { severity: 'fail_closed', attempted: false },
      ),
    );
  } else {
    const awsWhich = spawnSync('bash', ['-lc', 'command -v aws'], { encoding: 'utf8' });
    if (awsWhich.status !== 0) {
      checks.push(
        check(
          'live_b2_list_read',
          false,
          'fail-closed: B2 credentials present but aws CLI unavailable; live ListObjectsV2 not attempted (no writes performed)',
          { severity: 'fail_closed', attempted: false },
        ),
      );
    } else {
      const listed = liveB2ListViaAwsCli(env);
      const ok = listed.status === 0;
      checks.push(
        check(
          'live_b2_list_read',
          ok,
          ok
            ? 'aws s3api list-objects-v2 --max-keys 1 succeeded (read-only; credentials redacted)'
            : `list-objects-v2 failed status=${listed.status} detail=${(listed.stderr || listed.stdout || '').slice(0, 240)}`,
          { attempted: true, readOnly: true, maxKeys: 1 },
        ),
      );
    }
  }

  const blocking = checks.filter((c) => {
    if (c.severity === 'info') return false;
    if (c.name === 'live_b2_list_read' && c.severity === 'fail_closed') return false;
    return !c.ok;
  });

  const actorRole =
    opts.actorRole ||
    env.LGFC_VALIDATION_ACTOR_ROLE ||
    'Implementation / Operations';

  const result = {
    schemaVersion: 1,
    kind: 'platform_b2_runtime_validation',
    issue: 2892,
    parent: 2778,
    observedAt: now,
    candidateSha,
    actorRole,
    productionMutation: false,
    writeAttempts: 0,
    credentialsRedacted: true,
    expectedInventory: EXPECTED_B2_INVENTORY,
    summary: {
      total: checks.length,
      passed: checks.filter((c) => c.ok).length,
      failed: checks.filter((c) => !c.ok).length,
      blockingFailures: blocking.map((c) => c.name),
      knownDebt: [
        !hasB2Credentials(env) ? 'live_b2_unauthenticated_fail_closed' : null,
        inventory.corsMentioned ? 'b2_cors_console_finalization_may_remain' : 'b2_cors_doc_gap',
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
  console.log(`platform-b2-runtime-validation  ok=${result.ok}  sha=${result.candidateSha}  at=${result.observedAt}`);
  console.log(
    `checks ${result.summary.passed}/${result.summary.total} passed; blocking=${result.summary.blockingFailures.join(',') || 'none'}`,
  );
  if (result.summary.knownDebt.length) {
    console.log(`known debt: ${result.summary.knownDebt.join('; ')}`);
  }
  for (const c of result.checks) {
    const mark = c.ok ? 'PASS' : c.severity === 'info' ? 'INFO' : c.severity === 'fail_closed' ? 'FAIL-CLOSED' : 'FAIL';
    console.log(`  [${mark}] ${c.name}: ${c.detail}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node scripts/ci/platform-b2-runtime-validation.mjs [--json] [--skip-http]
Read-only B2 + integrated runtime validation for #2892.
Never writes Production/D1/B2. Live ListObjects requires B2_* credentials + aws CLI.
Secrets are redacted from output.`);
    process.exit(0);
  }
  const result = await runPlatformB2RuntimeValidation({ skipHttp: args.skipHttp });
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
