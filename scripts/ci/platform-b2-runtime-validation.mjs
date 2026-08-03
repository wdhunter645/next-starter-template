#!/usr/bin/env node
/**
 * #2892 / #2778-003 — read-only B2 + integrated runtime validation.
 *
 * Canonical surface after #3019/#3020 reconciliation:
 *   scripts/ci/platform-b2-runtime-validation.mjs
 *   npm run validate:platform-b2-runtime
 *
 * Never mutates Production, D1, B2, or Cloudflare configuration.
 * Never logs or embeds secret values. Live B2 ListObjects requires
 * credentials; without them the live step is fail-closed / skipped.
 *
 * Usage:
 *   node scripts/ci/platform-b2-runtime-validation.mjs
 *   node scripts/ci/platform-b2-runtime-validation.mjs --json
 *   node scripts/ci/platform-b2-runtime-validation.mjs --skip-http
 *   node scripts/ci/platform-b2-runtime-validation.mjs --allow-dirty
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

/**
 * Representative public read APIs that surface B2-backed media or health.
 * Intentionally excludes /api/matchup/current (GET closes/upserts weekly_matchups).
 */
export const INTEGRATED_PUBLIC_READ_PATHS = Object.freeze([
  '/api/health',
  '/api/photos/list',
  '/api/friends/list',
  '/api/milestones/list',
  '/api/matchup/results',
]);

/** Broader on-disk inventory of public D1/B2 read handlers (#3020 fold-in). */
export const PUBLIC_D1_B2_READ_PATHS = Object.freeze([
  { route: '/api/health', file: 'functions/api/health.ts' },
  { route: '/api/footer-quote', file: 'functions/api/footer-quote.ts' },
  { route: '/api/faq/list', file: 'functions/api/faq/list.ts' },
  { route: '/api/cms/get', file: 'functions/api/cms/get.ts' },
  { route: '/api/content/get', file: 'functions/api/content/get.ts' },
  { route: '/api/events/next', file: 'functions/api/events/next.ts' },
  { route: '/api/events/month', file: 'functions/api/events/month.ts' },
  { route: '/api/friends/list', file: 'functions/api/friends/list.ts' },
  { route: '/api/milestones/list', file: 'functions/api/milestones/list.ts' },
  { route: '/api/matchup/results', file: 'functions/api/matchup/results.ts' },
  { route: '/api/photos/list', file: 'functions/api/photos/list.ts' },
  { route: '/api/photos/get', file: 'functions/api/photos/get.ts' },
  { route: '/api/search', file: 'functions/api/search.ts' },
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

/**
 * Supported B2 object-mutation APIs / aliases that must not appear in Pages Functions.
 * Covers SDK-style names plus common camelCase aliases.
 */
export const B2_MUTATION_API_NAMES = Object.freeze([
  'PutObject',
  'DeleteObject',
  'DeleteObjects',
  'UploadPart',
  'UploadPartCopy',
  'CreateMultipartUpload',
  'CompleteMultipartUpload',
  'AbortMultipartUpload',
  'CopyObject',
  'putObject',
  'deleteObject',
  'deleteObjects',
  'uploadPart',
  'uploadPartCopy',
  'createMultipartUpload',
  'completeMultipartUpload',
  'abortMultipartUpload',
  'copyObject',
  'put-object',
  'delete-object',
  'delete-objects',
  'create-multipart-upload',
  'upload-part',
  'complete-multipart-upload',
  'copy-object',
]);

/** HTTP methods that mutate S3/B2 objects when used with AwsClient / B2 endpoint. */
export const B2_HTTP_MUTATION_METHODS = Object.freeze(['PUT', 'DELETE', 'POST']);

const B2_CONTEXT_RE =
  /\b(B2_|backblaze|AwsClient|listB2Objects|requireB2|B2_ENDPOINT|B2_BUCKET|B2_KEY_ID|s3\.[a-z0-9.-]+\.backblazeb2|PUBLIC_B2_BASE_URL)\b/i;

const HTTP_METHOD_RE = /method\s*:\s*['"`](GET|HEAD|PUT|DELETE|POST|PATCH|OPTIONS)['"`]/gi;

const DEFAULT_PUBLIC_HOSTS = [
  'https://www.lougehrigfanclub.com',
  'https://next-starter-template-6yr.pages.dev',
];

const CORS_PROBE_ORIGIN = 'https://www.lougehrigfanclub.com';

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
    allowDirty: argv.includes('--allow-dirty'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function gitSha() {
  const r = spawnSync('git', ['-C', REPO_ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

/** Authoritative worktree identity so candidateSha cannot silently omit dirty edits. */
export function resolveWorktreeIdentity(opts = {}) {
  const sha = opts.candidateSha || gitSha();
  if (opts.worktree) return opts.worktree;
  const status = spawnSync('git', ['-C', REPO_ROOT, 'status', '--porcelain'], { encoding: 'utf8' });
  const porcelain = status.status === 0 ? status.stdout : '';
  const dirty = Boolean(porcelain.trim());
  const dirtyHash = dirty
    ? createHash('sha256').update(porcelain).digest('hex').slice(0, 16)
    : null;
  const identity = dirty && sha ? `${sha}+dirty:${dirtyHash}` : sha;
  return { sha, dirty, dirtyHash, identity, porcelainBytes: porcelain.length };
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

/** Redact known credential env values from operator-facing text (exact values). */
export function redactSecrets(text, env = process.env) {
  let out = String(text ?? '');
  for (const key of SECRET_ENV_KEYS) {
    const value = String(env[key] || '').trim();
    if (value.length >= 4) {
      out = out.split(value).join(`[REDACTED:${key}]`);
    }
  }
  // Defense-in-depth for accidental AWS-style key material.
  out = out.replace(/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED:ACCESS_KEY]');
  return out;
}

/** Truncate + redact; never return raw stdout as failure detail. */
export function sanitizeCliDetail(stderr, stdout, env = process.env) {
  const primary = redactSecrets(String(stderr || '').trim(), env);
  if (primary) return primary.slice(0, 240);
  const secondary = redactSecrets(String(stdout || '').trim(), env);
  if (!secondary) return '(no detail)';
  return `[redacted-stdout] ${secondary.slice(0, 120)}`;
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
  const corsFinalized = !/once finalized in console|CORS rules not finalized|document(?:ed)? here once finalized/i.test(
    docText,
  );
  return { bucket, endpointHost, envNames, corsMentioned, corsFinalized };
}

export function parseB2Endpoint(endpoint) {
  const raw = String(endpoint || '').trim().replace(/\/$/, '');
  if (!raw.startsWith('https://')) {
    return { ok: false, host: null, region: null, reason: 'endpoint must start with https://' };
  }
  let host;
  try {
    host = new URL(raw).host;
  } catch {
    return { ok: false, host: null, region: null, reason: 'invalid URL' };
  }
  const m = /^s3\.([^.]+)\.backblazeb2\.com$/.exec(host);
  if (!m) {
    return {
      ok: false,
      host,
      region: null,
      reason: 'expected https://s3.<region>.backblazeb2.com',
    };
  }
  return { ok: true, host, region: m[1], reason: null };
}

/**
 * Policy scan: detect supported B2 write paths in Pages Functions.
 * Covers SDK/API names, kebab CLI aliases, and raw HTTP mutation methods
 * used in B2/AwsClient context (not generic email/admin POSTs).
 */
export function scanRuntimeForB2Mutations(functionsRoot = join(REPO_ROOT, 'functions')) {
  const files = collectFiles(functionsRoot, (name) => name.endsWith('.ts') || name.endsWith('.js'));
  const offenders = [];
  for (const rel of files) {
    const body = readFileSync(join(REPO_ROOT, rel), 'utf8');
    const reasons = [];
    for (const name of B2_MUTATION_API_NAMES) {
      if (body.includes(name)) reasons.push(`api:${name}`);
    }
    const hasB2Context = B2_CONTEXT_RE.test(body);
    if (hasB2Context) {
      HTTP_METHOD_RE.lastIndex = 0;
      let m;
      while ((m = HTTP_METHOD_RE.exec(body)) !== null) {
        const method = m[1].toUpperCase();
        if (B2_HTTP_MUTATION_METHODS.includes(method)) {
          reasons.push(`http:${method}`);
        }
      }
    }
    if (reasons.length) {
      offenders.push({ file: rel, reasons: [...new Set(reasons)] });
    }
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

export function evaluatePublicReadSuccess(path, result) {
  if (!result || result.status < 200 || result.status >= 300) {
    return { ok: false, reason: `expected 2xx, got ${result?.status ?? 'n/a'}` };
  }
  if (path === '/api/health') {
    const ok = result.json?.ok === true && result.json?.db_ok === true;
    return { ok, reason: ok ? 'ok=true db_ok=true' : 'health payload missing ok/db_ok' };
  }
  const ok = result.json?.ok === true;
  return { ok, reason: ok ? 'ok=true' : 'JSON success payload missing ok:true' };
}

export function evaluateCorsPreflight(probe, expectedOrigin = CORS_PROBE_ORIGIN) {
  const statusOk = probe.status === 200 || probe.status === 204;
  const allowOrigin = probe.headers?.['access-control-allow-origin'] || '';
  const allowMethods = String(probe.headers?.['access-control-allow-methods'] || '').toUpperCase();
  const originOk = allowOrigin === '*' || allowOrigin === expectedOrigin;
  const methodOk = allowMethods.split(/[\s,]+/).filter(Boolean).includes('GET');
  const ok = Boolean(statusOk && originOk && methodOk);
  return {
    ok,
    statusOk,
    originOk,
    methodOk,
    allowOrigin: allowOrigin || null,
    allowMethods: allowMethods || null,
    detail: ok
      ? `preflight OK status=${probe.status}; ACAO=${allowOrigin}; methods include GET`
      : `preflight incomplete status=${probe.status}; ACAO=${allowOrigin || 'missing'}; methods=${allowMethods || 'missing'} (require 2xx + allowed origin + GET)`,
  };
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

async function fetchWithMethod(url, method, timeoutMs = 12000, headers = undefined) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers,
      redirect: 'follow',
    });
    const outHeaders = {};
    for (const name of [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers',
      'content-type',
      'x-bz-file-id',
      'etag',
    ]) {
      const v = res.headers.get(name);
      if (v) outHeaders[name] = v;
    }
    let text = '';
    if (method !== 'HEAD') {
      text = (await res.text()).slice(0, 200);
    }
    return { ok: res.ok, status: res.status, headers: outHeaders, text };
  } finally {
    clearTimeout(t);
  }
}

function liveB2ListViaAwsCli(env = process.env) {
  const endpoint = String(env.B2_ENDPOINT || '').trim().replace(/\/$/, '');
  const bucket = String(env.B2_BUCKET || '').trim();
  const parsed = parseB2Endpoint(endpoint);
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
        AWS_DEFAULT_REGION: parsed.region || 'us-east-005',
        AWS_EC2_METADATA_DISABLED: 'true',
      },
      timeout: 60000,
    },
  );
  return {
    status: aws.status,
    detail: sanitizeCliDetail(aws.stderr, aws.stdout, env),
  };
}

export async function runPlatformB2RuntimeValidation(opts = {}) {
  const skipHttp = Boolean(opts.skipHttp);
  const allowDirty = Boolean(opts.allowDirtyWorktree);
  const now = new Date().toISOString();
  const worktree = resolveWorktreeIdentity(opts);
  const candidateSha = worktree.identity;
  const env = opts.env || process.env;
  const checks = [];

  checks.push(
    check(
      'candidate_worktree_clean',
      allowDirty || !worktree.dirty,
      worktree.dirty
        ? allowDirty
          ? `dirty worktree allowed; identity=${worktree.identity}`
          : `dirty worktree refuses clean candidate evidence; identity=${worktree.identity}`
        : `worktree clean; candidateSha=${worktree.identity}`,
      { worktree, severity: allowDirty && worktree.dirty ? 'info' : undefined },
    ),
  );

  const b2Doc = readText('docs/reference/platform/Backblaze_B2.md') || '';
  const envExample = readText('.env.example') || '';
  const b2Lib = readText('functions/_lib/b2.ts') || '';
  const photoUrlLib = readText('functions/_lib/photo-url.ts') || '';
  const syncHandler = readText('functions/api/admin/media-assets/sync-from-b2.ts') || '';
  const reconcileScript = readText('scripts/b2_d1_deletion_reconcile.sh') || '';
  const smokeScript = readText('scripts/b2_s3_smoketest.sh') || '';
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
  const bucketOk =
    inventory.bucket === EXPECTED_B2_INVENTORY.bucket &&
    inventory.endpointHost === EXPECTED_B2_INVENTORY.endpointHost;
  checks.push(
    check(
      'b2_bucket_metadata',
      bucketOk,
      bucketOk
        ? `bucket=${inventory.bucket}; endpoint=${inventory.endpointHost}`
        : `mismatch bucket=${inventory.bucket || 'missing'}; endpoint=${inventory.endpointHost || 'missing'}`,
      { inventory },
    ),
  );

  const missingEnvDoc = EXPECTED_B2_ENV_NAMES.filter((n) => !inventory.envNames.includes(n));
  const missingEnvExample = EXPECTED_B2_ENV_NAMES.filter((n) => !envExample.includes(`${n}=`));
  const envDocOk = missingEnvDoc.length === 0 && missingEnvExample.length === 0;
  checks.push(
    check(
      'b2_env_names_documented',
      envDocOk,
      envDocOk
        ? `all ${EXPECTED_B2_ENV_NAMES.length} B2 env names present in docs + .env.example (values not required)`
        : `missing doc=${missingEnvDoc.join(',') || 'none'}; missing .env.example=${missingEnvExample.join(',') || 'none'}`,
    ),
  );

  checks.push(
    check(
      'b2_cors_documented',
      inventory.corsMentioned,
      inventory.corsMentioned
        ? inventory.corsFinalized
          ? 'CORS section present and appears finalized in Backblaze_B2.md'
          : 'CORS section present in Backblaze_B2.md (rules may still need console finalization)'
        : 'CORS not mentioned in B2 inventory doc',
      { severity: 'info', corsFinalized: inventory.corsFinalized },
    ),
  );

  const failClosedOk = Boolean(
    b2Lib.includes('requireB2') && b2Lib.includes('B2 secrets missing') && b2Lib.includes('listB2Objects'),
  );
  checks.push(
    check(
      'b2_fail_closed_helper',
      failClosedOk,
      failClosedOk
        ? 'functions/_lib/b2.ts requireB2 + listB2Objects + missing-secrets fail-closed present'
        : b2Lib
          ? 'functions/_lib/b2.ts present but missing requireB2 / listB2Objects / fail-closed markers'
          : 'missing b2 helper',
    ),
  );

  const b2LibMutationFree = !B2_MUTATION_API_NAMES.some((n) => b2Lib.includes(n));
  const runtimeListOnlyOk = Boolean(b2Lib.includes('ListObjectsV2') && b2LibMutationFree);
  checks.push(
    check(
      'b2_runtime_list_only',
      runtimeListOnlyOk,
      runtimeListOnlyOk
        ? 'functions/_lib/b2.ts uses ListObjectsV2 only (no Put/Delete/multipart mutation APIs)'
        : b2Lib
          ? 'functions/_lib/b2.ts missing ListObjectsV2 or contains mutation API markers'
          : 'missing b2 helper',
    ),
  );

  const mutationScan = scanRuntimeForB2Mutations();
  const mutationOk = mutationScan.offenders.length === 0;
  checks.push(
    check(
      'functions_no_b2_object_mutation',
      mutationOk,
      mutationOk
        ? `scanned ${mutationScan.filesScanned} function files; no B2 mutation APIs or B2-context HTTP PUT/DELETE/POST`
        : `offenders: ${mutationScan.offenders
            .slice(0, 10)
            .map((o) => `${o.file}[${o.reasons.join('|')}]`)
            .join(', ')}`,
      { offenders: mutationScan.offenders },
    ),
  );

  checks.push(
    check(
      'photo_url_public_base',
      Boolean(photoUrlLib.includes('PUBLIC_B2_BASE_URL') || photoUrlLib.includes('LouGehrigFanClub')),
      photoUrlLib
        ? 'functions/_lib/photo-url.ts references public B2 URL construction'
        : 'missing photo-url helper',
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

  const missingReadPaths = PUBLIC_D1_B2_READ_PATHS.filter(({ file }) => !existsSync(join(REPO_ROOT, file)));
  checks.push(
    check(
      'public_d1_b2_read_paths_on_disk',
      missingReadPaths.length === 0,
      missingReadPaths.length === 0
        ? `${PUBLIC_D1_B2_READ_PATHS.length} inventoried public read handlers present`
        : `missing: ${missingReadPaths.map((p) => p.route).join(', ')}`,
      { missing: missingReadPaths },
    ),
  );

  const b2Resources = (isolationManifest?.resources || []).filter(
    (r) => r.category === 'b2' || String(r.id || '').startsWith('b2') || String(r.id || '').includes('b2'),
  );
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

  const previewGetOk = Boolean(
    syncHandler && /onRequestGet[\s\S]*405/.test(syncHandler) && syncHandler.includes('requireAdmin'),
  );
  checks.push(
    check(
      'preview_no_production_b2_write_via_get',
      previewGetOk,
      previewGetOk
        ? 'Admin B2 sync rejects GET (405) and requires ADMIN_TOKEN on POST — preview cannot write without mirrored secrets'
        : 'Admin B2 sync GET rejection / requireAdmin markers missing',
    ),
  );

  const reconcileOk =
    /refusing deletion reconciliation \(fail closed\)/i.test(reconcileScript) ||
    /B2 inventory is empty/i.test(reconcileScript);
  checks.push(
    check(
      'deletion_reconcile_fail_closed',
      Boolean(reconcileScript) && reconcileOk,
      reconcileScript
        ? reconcileOk
          ? 'b2_d1_deletion_reconcile.sh refuses empty inventory (fail closed)'
          : 'deletion reconcile script missing empty-inventory fail-closed markers'
        : 'missing b2_d1_deletion_reconcile.sh',
    ),
  );

  const smokeOk = Boolean(smokeScript.includes('list-objects-v2') && smokeScript.includes('max-keys'));
  checks.push(
    check(
      'b2_s3_smoke_script_present',
      smokeOk,
      smokeOk
        ? 'b2_s3_smoketest.sh performs read-only list-objects-v2'
        : smokeScript
          ? 'b2_s3_smoketest.sh missing list-objects-v2/max-keys markers'
          : 'missing b2_s3_smoketest.sh',
    ),
  );

  // Integrated runtime HTTP checks (GET only; no side-effect routes).
  if (!skipHttp) {
    for (const host of opts.publicHosts || DEFAULT_PUBLIC_HOSTS) {
      const hostKey = host.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '_');
      for (const path of INTEGRATED_PUBLIC_READ_PATHS) {
        const url = `${host.replace(/\/$/, '')}${path}`;
        try {
          const result = await fetchJson(url);
          const evaluated = evaluatePublicReadSuccess(path, result);
          checks.push(
            check(
              `http_get_${hostKey}_${path.replace(/[^a-z0-9]+/gi, '_')}`,
              evaluated.ok,
              redactSecrets(
                `GET ${url} status=${result.status} ${evaluated.reason}`,
                env,
              ),
              { host, path, status: result.status },
            ),
          );
        } catch (err) {
          checks.push(
            check(
              `http_get_${hostKey}_${path.replace(/[^a-z0-9]+/gi, '_')}`,
              false,
              redactSecrets(`GET ${url} failed: ${err.message}`, env),
            ),
          );
        }
      }

      // Admin sync GET must not mutate; expect 401/403/405 without token (bounded timeout).
      const syncUrl = `${host.replace(/\/$/, '')}/api/admin/media-assets/sync-from-b2`;
      try {
        const res = await fetchWithMethod(syncUrl, 'GET', 12000, { Accept: 'application/json' });
        const text = redactSecrets(String(res.text || '').slice(0, 200), env);
        const bounded = res.status === 401 || res.status === 403 || res.status === 405;
        checks.push(
          check(
            `http_admin_sync_get_bounded_${hostKey}`,
            bounded,
            `GET ${syncUrl} status=${res.status} body=${text}`,
          ),
        );
      } catch (err) {
        checks.push(
          check(
            `http_admin_sync_get_bounded_${hostKey}`,
            false,
            redactSecrets(`GET ${syncUrl} failed: ${err.message}`, env),
          ),
        );
      }
    }

    // Public bucket CORS preflight must succeed with allowed origin + GET.
    const publicObjectBase = `https://${EXPECTED_B2_INVENTORY.endpointHost}/${EXPECTED_B2_INVENTORY.bucket}`;
    const corsProbeUrl = `${publicObjectBase}/`;
    try {
      const opt = await fetchWithMethod(corsProbeUrl, 'OPTIONS', 12000, {
        Origin: CORS_PROBE_ORIGIN,
        'Access-Control-Request-Method': 'GET',
      });
      const cors = evaluateCorsPreflight(opt, CORS_PROBE_ORIGIN);
      checks.push(
        check('public_b2_cors_probe', cors.ok, cors.detail, {
          severity: cors.ok ? undefined : 'info',
          headers: opt.headers,
          cors,
        }),
      );
    } catch (err) {
      checks.push(
        check('public_b2_cors_probe', false, `OPTIONS failed: ${err.message}`, { severity: 'info' }),
      );
    }

    try {
      const head = await fetchWithMethod(`${publicObjectBase}/`, 'HEAD');
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
        check('public_b2_endpoint_reachable', false, `HEAD ${publicObjectBase}/ failed: ${err.message}`, {
          severity: 'info',
        }),
      );
    }

    const publicBase = String(env.PUBLIC_B2_BASE_URL || '').trim().replace(/\/$/, '');
    if (publicBase) {
      try {
        const probe = await fetchWithMethod(publicBase, 'GET');
        const reachable = probe.status >= 200 && probe.status < 500;
        checks.push(
          check(
            'public_b2_base_url_reachable',
            reachable,
            `GET PUBLIC_B2_BASE_URL status=${probe.status} (credential values not logged)`,
            { status: probe.status },
          ),
        );
      } catch (err) {
        checks.push(
          check('public_b2_base_url_reachable', false, `PUBLIC_B2_BASE_URL probe failed: ${err.message}`),
        );
      }
    } else {
      checks.push(
        check(
          'public_b2_base_url_reachable',
          true,
          'PUBLIC_B2_BASE_URL unset in this runtime; public media base probe skipped',
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
    const parsedEndpoint = parseB2Endpoint(env.B2_ENDPOINT);
    checks.push(
      check(
        'live_b2_endpoint_format',
        parsedEndpoint.ok,
        parsedEndpoint.ok
          ? `endpoint host=${parsedEndpoint.host} region=${parsedEndpoint.region}`
          : `invalid B2_ENDPOINT: ${parsedEndpoint.reason}`,
      ),
    );
    if (!parsedEndpoint.ok) {
      checks.push(
        check('live_b2_list_read', false, 'skipped ListObjectsV2 because endpoint format is invalid', {
          attempted: false,
        }),
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
              : `list-objects-v2 failed status=${listed.status} detail=${listed.detail}`,
            { attempted: true, readOnly: true, maxKeys: 1 },
          ),
        );
      }
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
    schemaVersion: 2,
    kind: 'platform_b2_runtime_validation',
    issue: 2892,
    parent: 2778,
    observedAt: now,
    candidateSha,
    worktree,
    actorRole,
    productionMutation: false,
    writeAttempts: 0,
    credentialsRedacted: true,
    expectedInventory: EXPECTED_B2_INVENTORY,
    reconciliation: {
      retainedSurface: 'platform-b2-runtime-validation',
      foldedFrom: 'platform-b2-validation (#3020)',
      disposition:
        'Single canonical validator/tests/evidence/npm script; #3020 alternate filenames not reintroduced',
    },
    summary: {
      total: checks.length,
      passed: checks.filter((c) => c.ok).length,
      failed: checks.filter((c) => !c.ok).length,
      blockingFailures: blocking.map((c) => c.name),
      knownDebt: [
        !hasB2Credentials(env) ? 'live_b2_unauthenticated_fail_closed' : null,
        inventory.corsMentioned && !inventory.corsFinalized
          ? 'b2_cors_console_finalization_may_remain'
          : !inventory.corsMentioned
            ? 'b2_cors_doc_gap'
            : null,
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
  if (result.worktree?.dirty) {
    console.log(`worktree: dirty identity=${result.worktree.identity}`);
  }
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
    console.log(`Usage: node scripts/ci/platform-b2-runtime-validation.mjs [--json] [--skip-http] [--allow-dirty]
Read-only B2 + integrated runtime validation for #2892.
Never writes Production/D1/B2. Live ListObjects requires B2_* credentials + aws CLI.
Secrets are redacted from output. Dirty worktrees refuse clean candidate evidence unless --allow-dirty.`);
    process.exit(0);
  }
  const result = await runPlatformB2RuntimeValidation({
    skipHttp: args.skipHttp,
    allowDirtyWorktree: args.allowDirty,
  });
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
