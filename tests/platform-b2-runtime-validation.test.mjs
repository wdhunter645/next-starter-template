import { describe, expect, it } from 'vitest';
import {
  EXPECTED_B2_INVENTORY,
  INTEGRATED_PUBLIC_READ_PATHS,
  hasB2Credentials,
  parseB2DocInventory,
  redactSecrets,
  runPlatformB2RuntimeValidation,
  scanRuntimeForB2Mutations,
} from '../scripts/ci/platform-b2-runtime-validation.mjs';

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
`);
    expect(parsed.bucket).toBe(EXPECTED_B2_INVENTORY.bucket);
    expect(parsed.endpointHost).toBe(EXPECTED_B2_INVENTORY.endpointHost);
    expect(parsed.envNames).toEqual(
      expect.arrayContaining(['B2_KEY_ID', 'B2_APP_KEY', 'B2_BUCKET', 'B2_ENDPOINT', 'PUBLIC_B2_BASE_URL']),
    );
    expect(parsed.corsMentioned).toBe(true);
  });

  it('redacts credential values from operator text', () => {
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

  it('detects absence of B2 object-mutation symbols in functions/', () => {
    const scan = scanRuntimeForB2Mutations();
    expect(scan.filesScanned).toBeGreaterThan(10);
    expect(scan.offenders).toEqual([]);
  });

  it('reports missing B2 credentials as false', () => {
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
        B2_KEY_ID: 'x',
        B2_APP_KEY: 'y',
        B2_ENDPOINT: 'https://s3.us-east-005.backblazeb2.com',
        B2_BUCKET: 'LouGehrigFanClub',
      }),
    ).toBe(true);
  });

  it('exposes integrated public read path inventory', () => {
    expect(INTEGRATED_PUBLIC_READ_PATHS).toEqual(
      expect.arrayContaining(['/api/health', '/api/photos/list', '/api/friends/list']),
    );
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
        actorRole: 'test-runner',
        env: {},
      });
      expect(result.productionMutation).toBe(false);
      expect(result.writeAttempts).toBe(0);
      expect(result.credentialsRedacted).toBe(true);
      expect(result.actorRole).toBe('test-runner');
      expect(result.issue).toBe(2892);
      expect(result.ok).toBe(true);
      expect(result.summary.knownDebt).toEqual(
        expect.arrayContaining(['live_b2_unauthenticated_fail_closed']),
      );
      const live = result.checks.find((c) => c.name === 'live_b2_list_read');
      expect(live?.ok).toBe(false);
      expect(live?.severity).toBe('fail_closed');
      const runtimeOnly = result.checks.find((c) => c.name === 'b2_runtime_list_only');
      expect(runtimeOnly?.ok).toBe(true);
      const isolation = result.checks.find((c) => c.name === 'preview_isolation_b2_rules');
      expect(isolation?.ok).toBe(true);
      const sync = result.checks.find((c) => c.name === 'admin_b2_sync_protected');
      expect(sync?.ok).toBe(true);
    } finally {
      for (const [key, value] of Object.entries(prior)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});
