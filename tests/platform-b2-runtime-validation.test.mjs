import { describe, expect, it } from 'vitest';
import {
  B2_MUTATION_API_NAMES,
  EXPECTED_B2_INVENTORY,
  INTEGRATED_PUBLIC_READ_PATHS,
  PUBLIC_D1_B2_READ_PATHS,
  evaluateCorsPreflight,
  evaluatePublicReadSuccess,
  hasB2Credentials,
  parseB2DocInventory,
  parseB2Endpoint,
  redactSecrets,
  resolveWorktreeIdentity,
  runPlatformB2RuntimeValidation,
  sanitizeCliDetail,
  scanRuntimeForB2Mutations,
} from '../scripts/ci/platform-b2-runtime-validation.mjs';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

describe('platform-b2-runtime-validation helpers', () => {
  it('parses B2 inventory metadata from docs text', () => {
    const parsed = parseB2DocInventory(`
Bucket:
- Name: LouGehrigFanClub
- S3-compatible endpoint: s3.us-east-005.backblazeb2.com

Expected env vars (names only):
- B2_KEY_ID
- B2_APP_KEY
- B2_BUCKET
- B2_ENDPOINT
- PUBLIC_B2_BASE_URL

## CORS / Public Access
Bucket is public.
CORS rules (if needed) should be documented here once finalized in console.
`);
    expect(parsed.bucket).toBe(EXPECTED_B2_INVENTORY.bucket);
    expect(parsed.endpointHost).toBe(EXPECTED_B2_INVENTORY.endpointHost);
    expect(parsed.envNames).toEqual(
      expect.arrayContaining(['B2_KEY_ID', 'B2_APP_KEY', 'B2_BUCKET', 'B2_ENDPOINT', 'PUBLIC_B2_BASE_URL']),
    );
    expect(parsed.corsMentioned).toBe(true);
    expect(parsed.corsFinalized).toBe(false);
  });

  it('validates B2 endpoint format', () => {
    expect(parseB2Endpoint('https://s3.us-east-005.backblazeb2.com')).toEqual({
      ok: true,
      host: 's3.us-east-005.backblazeb2.com',
      region: 'us-east-005',
      reason: null,
    });
    expect(parseB2Endpoint('http://bad.example').ok).toBe(false);
  });

  it('redacts exact credential values from operator text', () => {
    const env = {
      B2_KEY_ID: 'keyidEXAMPLE1234567890',
      B2_APP_KEY: 'appkeyEXAMPLE1234567890ABCD',
    };
    const out = redactSecrets(`id=${env.B2_KEY_ID} secret=${env.B2_APP_KEY}`, env);
    expect(out).not.toContain(env.B2_KEY_ID);
    expect(out).not.toContain(env.B2_APP_KEY);
    expect(out).toContain('[REDACTED:B2_KEY_ID]');
    expect(out).toContain('[REDACTED:B2_APP_KEY]');
  });

  it('sanitizes CLI failure detail using exact secret redaction (not AKIA-only)', () => {
    const env = {
      B2_KEY_ID: '004abcKEYID1234567890',
      B2_APP_KEY: 'K004secretAppKeyValueXYZ',
    };
    const detail = sanitizeCliDetail(
      `InvalidClientTokenId: token ${env.B2_KEY_ID} secret=${env.B2_APP_KEY}`,
      `stdout leaked ${env.B2_APP_KEY}`,
      env,
    );
    expect(detail).not.toContain(env.B2_KEY_ID);
    expect(detail).not.toContain(env.B2_APP_KEY);
    expect(detail).toContain('[REDACTED:B2_KEY_ID]');
  });

  it('detects B2 mutation APIs and B2-context HTTP mutation methods', () => {
    const dir = mkdtempSync(join(tmpdir(), 'b2-mut-'));
    try {
      writeFileSync(
        join(dir, 'bad-put.ts'),
        `import { AwsClient } from "./aws4fetch";\nconst x = new AwsClient({});\nawait x.fetch(url, { method: "PUT" });\n`,
      );
      writeFileSync(join(dir, 'bad-api.ts'), `client.send(new PutObjectCommand({}));\n`);
      writeFileSync(join(dir, 'ok-list.ts'), `import { AwsClient } from "./aws4fetch";\nawait aws.fetch(url, { method: "GET" });\n`);
      const scan = scanRuntimeForB2Mutations(dir);
      expect(scan.filesScanned).toBe(3);
      const bases = scan.offenders.map((o) => o.file.split(/[\\/]/).pop()).sort();
      expect(bases).toEqual(['bad-api.ts', 'bad-put.ts']);
      expect(scan.offenders.find((o) => o.file.endsWith('bad-put.ts'))?.reasons).toContain('http:PUT');
      expect(scan.offenders.find((o) => o.file.endsWith('bad-api.ts'))?.reasons).toContain('api:PutObject');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports no B2 mutation offenders in live functions/', () => {
    const scan = scanRuntimeForB2Mutations();
    expect(scan.filesScanned).toBeGreaterThan(10);
    expect(scan.offenders).toEqual([]);
    expect(B2_MUTATION_API_NAMES).toEqual(expect.arrayContaining(['PutObject', 'put-object', 'CopyObject']));
  });

  it('reports missing or whitespace-only B2 credentials as false', () => {
    expect(
      hasB2Credentials({
        B2_KEY_ID: '',
        B2_APP_KEY: '',
        B2_ENDPOINT: '',
        B2_BUCKET: '',
      }),
    ).toBe(false);
    expect(
      hasB2Credentials({
        B2_KEY_ID: '   ',
        B2_APP_KEY: '   ',
        B2_ENDPOINT: '   ',
        B2_BUCKET: '   ',
      }),
    ).toBe(false);
    expect(
      hasB2Credentials({
        B2_KEY_ID: 'x',
        B2_APP_KEY: 'y',
        B2_ENDPOINT: 'https://s3.us-east-005.backblazeb2.com',
        B2_BUCKET: 'LouGehrigFanClub',
      }),
    ).toBe(true);
  });

  it('requires 2xx + success payload for representative public reads', () => {
    expect(evaluatePublicReadSuccess('/api/health', { status: 200, json: { ok: true, db_ok: true } }).ok).toBe(true);
    expect(evaluatePublicReadSuccess('/api/health', { status: 200, json: { ok: true, db_ok: false } }).ok).toBe(false);
    expect(evaluatePublicReadSuccess('/api/photos/list', { status: 404, json: { ok: false } }).ok).toBe(false);
    expect(evaluatePublicReadSuccess('/api/photos/list', { status: 200, json: { ok: true, items: [] } }).ok).toBe(true);
    expect(evaluatePublicReadSuccess('/api/photos/list', { status: 200, json: { items: [] } }).ok).toBe(false);
  });

  it('requires successful CORS preflight with allowed origin and GET', () => {
    expect(
      evaluateCorsPreflight({
        status: 403,
        headers: {},
      }).ok,
    ).toBe(false);
    expect(
      evaluateCorsPreflight({
        status: 204,
        headers: {
          'access-control-allow-origin': 'https://www.lougehrigfanclub.com',
          'access-control-allow-methods': 'GET, HEAD',
        },
      }).ok,
    ).toBe(true);
  });

  it('exposes integrated public read path inventory without side-effect matchup/current', () => {
    expect(INTEGRATED_PUBLIC_READ_PATHS).toEqual(
      expect.arrayContaining(['/api/health', '/api/photos/list', '/api/friends/list']),
    );
    expect(INTEGRATED_PUBLIC_READ_PATHS).not.toContain('/api/matchup/current');
    expect(PUBLIC_D1_B2_READ_PATHS.some((p) => p.route === '/api/photos/list')).toBe(true);
    expect(PUBLIC_D1_B2_READ_PATHS.some((p) => p.route === '/api/matchup/current')).toBe(false);
  });

  it('records dirty worktree identity instead of silent clean SHA', () => {
    const identity = resolveWorktreeIdentity({
      candidateSha: 'abc123',
      worktree: {
        sha: 'abc123',
        dirty: true,
        dirtyHash: 'deadbeef',
        identity: 'abc123+dirty:deadbeef',
        porcelainBytes: 12,
      },
    });
    expect(identity.dirty).toBe(true);
    expect(identity.identity).toBe('abc123+dirty:deadbeef');
  });
});

describe('platform-b2-runtime-validation runner', () => {
  it('passes repository checks without live B2 credentials (HTTP skipped)', async () => {
    const prior = {
      B2_KEY_ID: process.env.B2_KEY_ID,
      B2_APP_KEY: process.env.B2_APP_KEY,
      B2_ENDPOINT: process.env.B2_ENDPOINT,
      B2_BUCKET: process.env.B2_BUCKET,
    };
    delete process.env.B2_KEY_ID;
    delete process.env.B2_APP_KEY;
    delete process.env.B2_ENDPOINT;
    delete process.env.B2_BUCKET;
    try {
      const result = await runPlatformB2RuntimeValidation({
        skipHttp: true,
        allowDirtyWorktree: true,
        actorRole: 'test-runner',
        env: {},
        candidateSha: 'test-candidate',
        worktree: {
          sha: 'test-candidate',
          dirty: false,
          dirtyHash: null,
          identity: 'test-candidate',
          porcelainBytes: 0,
        },
      });
      expect(result.productionMutation).toBe(false);
      expect(result.writeAttempts).toBe(0);
      expect(result.credentialsRedacted).toBe(true);
      expect(result.actorRole).toBe('test-runner');
      expect(result.issue).toBe(2892);
      expect(result.ok).toBe(true);
      expect(result.candidateSha).toBe('test-candidate');
      expect(result.reconciliation.retainedSurface).toBe('platform-b2-runtime-validation');
      expect(result.summary.knownDebt).toEqual(
        expect.arrayContaining(['live_b2_unauthenticated_fail_closed']),
      );
      const live = result.checks.find((c) => c.name === 'live_b2_list_read');
      expect(live?.ok).toBe(false);
      expect(live?.severity).toBe('fail_closed');
      expect(live?.attempted).toBe(false);
      const runtimeOnly = result.checks.find((c) => c.name === 'b2_runtime_list_only');
      expect(runtimeOnly?.ok).toBe(true);
      expect(runtimeOnly?.detail).toMatch(/ListObjectsV2 only/);
      const failClosed = result.checks.find((c) => c.name === 'b2_fail_closed_helper');
      expect(failClosed?.ok).toBe(true);
      expect(failClosed?.detail).toMatch(/requireB2 \+ listB2Objects/);
      const isolation = result.checks.find((c) => c.name === 'preview_isolation_b2_rules');
      expect(isolation?.ok).toBe(true);
      const sync = result.checks.find((c) => c.name === 'admin_b2_sync_protected');
      expect(sync?.ok).toBe(true);
      const reconcile = result.checks.find((c) => c.name === 'deletion_reconcile_fail_closed');
      expect(reconcile?.ok).toBe(true);
      const mutation = result.checks.find((c) => c.name === 'functions_no_b2_object_mutation');
      expect(mutation?.ok).toBe(true);
      expect(mutation?.detail).toMatch(/no B2 mutation APIs or B2-context HTTP/);
    } finally {
      for (const [key, value] of Object.entries(prior)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });

  it('refuses clean candidate evidence from a dirty worktree unless allowed', async () => {
    const blocked = await runPlatformB2RuntimeValidation({
      skipHttp: true,
      allowDirtyWorktree: false,
      env: {},
      candidateSha: 'deadbeef',
      worktree: {
        sha: 'deadbeef',
        dirty: true,
        dirtyHash: 'cafebabe',
        identity: 'deadbeef+dirty:cafebabe',
        porcelainBytes: 40,
      },
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.candidateSha).toBe('deadbeef+dirty:cafebabe');
    const clean = blocked.checks.find((c) => c.name === 'candidate_worktree_clean');
    expect(clean?.ok).toBe(false);

    const allowed = await runPlatformB2RuntimeValidation({
      skipHttp: true,
      allowDirtyWorktree: true,
      env: {},
      candidateSha: 'deadbeef',
      worktree: {
        sha: 'deadbeef',
        dirty: true,
        dirtyHash: 'cafebabe',
        identity: 'deadbeef+dirty:cafebabe',
        porcelainBytes: 40,
      },
    });
    expect(allowed.ok).toBe(true);
    const cleanAllowed = allowed.checks.find((c) => c.name === 'candidate_worktree_clean');
    expect(cleanAllowed?.ok).toBe(true);
    expect(cleanAllowed?.severity).toBe('info');
  });
});
