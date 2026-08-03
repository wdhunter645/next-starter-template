import { describe, expect, it } from 'vitest';
import {
  extractCreateTablesFromMigrations,
  findMigrationPrefixCollisions,
  parseWranglerToml,
  REQUIRED_APPLICATION_TABLES,
  runPlatformCfD1Validation,
} from '../scripts/ci/platform-cf-d1-validation.mjs';

describe('platform-cf-d1-validation helpers', () => {
  it('parses wrangler.toml D1 and Pages fields', () => {
    const parsed = parseWranglerToml(`
name = "lgfc-lite"
pages_build_output_dir = "./out"
[[d1_databases]]
binding = "DB"
database_name = "lgfc_lite"
database_id = "22d0dc3e-ad34-43af-8e6a-2063df1a1e04"
`);
    expect(parsed.name).toBe('lgfc-lite');
    expect(parsed.outputDir).toBe('./out');
    expect(parsed.binding).toBe('DB');
    expect(parsed.databaseName).toBe('lgfc_lite');
    expect(parsed.databaseId).toBe('22d0dc3e-ad34-43af-8e6a-2063df1a1e04');
  });

  it('detects known migration prefix collisions from the repository', () => {
    const { collisions } = findMigrationPrefixCollisions();
    const prefixes = collisions.map((c) => c.prefix);
    expect(prefixes).toEqual(expect.arrayContaining(['0020', '0028', '0044']));
  });

  it('finds required application tables in migrations', () => {
    const tables = extractCreateTablesFromMigrations();
    for (const name of REQUIRED_APPLICATION_TABLES) {
      expect(tables.has(name), name).toBe(true);
    }
  });
});

describe('platform-cf-d1-validation runner', () => {
  it('passes repository checks without live Cloudflare credentials (HTTP skipped)', async () => {
    const prior = {
      CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
      CF_API_TOKEN: process.env.CF_API_TOKEN,
      CF_ACCOUNT_ID: process.env.CF_ACCOUNT_ID,
    };
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CF_API_TOKEN;
    delete process.env.CF_ACCOUNT_ID;
    try {
      const result = await runPlatformCfD1Validation({
        skipHttp: true,
        actorRole: 'test-runner',
      });
      expect(result.productionMutation).toBe(false);
      expect(result.writeAttempts).toBe(0);
      expect(result.actorRole).toBe('test-runner');
      expect(result.ok).toBe(true);
      expect(result.summary.knownDebt).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^migration_prefix_collision:/),
          'live_d1_unauthenticated_fail_closed',
        ]),
      );
      const drift = result.checks.find((c) => c.name === 'pages_name_drift_recorded');
      expect(drift?.ok).toBe(true);
      expect(drift?.severity).toBe('info');
      const live = result.checks.find((c) => c.name === 'live_d1_schema_read');
      expect(live?.ok).toBe(false);
      expect(live?.severity).toBe('fail_closed');
      const inventory = result.checks.find((c) => c.name === 'functions_inventory');
      expect(inventory?.sideEffectGet?.length ?? 0).toBeGreaterThan(0);
    } finally {
      for (const [key, value] of Object.entries(prior)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
    }
  });
});
