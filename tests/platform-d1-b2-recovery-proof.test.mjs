import { describe, expect, it } from 'vitest';
import { existsSync, rmSync } from 'node:fs';
import {
  assertNoLiveProductionRestoreAttempted,
  buildSyntheticB2Catalog,
  DISABLE_ENV,
  isToolingDisabled,
  PROTECTED_DECISIONS,
  reconcileCatalogToD1,
  RECOVERY_TARGETS,
  runD1IsolatedRestoreProof,
  runPlatformD1B2RecoveryProof,
  SYNTHETIC_APPLICATION_TABLES,
  verifyB2IntegritySample,
} from '../scripts/ci/platform-d1-b2-recovery-proof.mjs';

describe('platform-d1-b2-recovery-proof helpers', () => {
  it('recognizes disable env', () => {
    expect(isToolingDisabled({ [DISABLE_ENV]: '1' })).toBe(true);
    expect(isToolingDisabled({})).toBe(false);
  });

  it('records protected decisions', () => {
    const ids = PROTECTED_DECISIONS.map((d) => d.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'no_production_mutation',
        'synthetic_or_redacted_only',
        'no_secret_values',
        'live_provider_restore_deferred',
        'zero_cost_baseline',
      ]),
    );
  });

  it('blocks Production restore force flags', () => {
    const ok = assertNoLiveProductionRestoreAttempted({});
    expect(ok.ok).toBe(true);
    const blocked = assertNoLiveProductionRestoreAttempted({
      LGFC_FORCE_PRODUCTION_D1_RESTORE: '1',
    });
    expect(blocked.ok).toBe(false);
  });

  it('verifies synthetic B2 integrity and D1 catalog reconcile', () => {
    const catalog = buildSyntheticB2Catalog();
    const integrity = verifyB2IntegritySample(catalog);
    expect(integrity.ok).toBe(true);
    expect(integrity.sampled).toBe(3);

    const mediaRows = catalog.objects.map((o) => ({ b2_key: o.key, size: o.size }));
    const reconcile = reconcileCatalogToD1(mediaRows, catalog);
    expect(reconcile.ok).toBe(true);
    expect(reconcile.missingInCatalog).toEqual([]);
  });
});

describe('platform-d1-b2-recovery-proof isolated restore', () => {
  it('exports, restores, measures time, and cleans disposable artifacts', () => {
    const proof = runD1IsolatedRestoreProof({ keepArtifacts: true });
    try {
      expect(proof.ok).toBe(true);
      expect(proof.exportDigest).toHaveLength(64);
      expect(proof.mediaRows).toHaveLength(3);
      expect(proof.elapsedMs).toBeLessThan(RECOVERY_TARGETS.d1.rtoMs);
      for (const table of SYNTHETIC_APPLICATION_TABLES) {
        expect(proof.checks.some((c) => c.name === `d1_table_present:${table}` && c.ok)).toBe(
          true,
        );
      }
      expect(existsSync(proof.workDir)).toBe(true);
    } finally {
      rmSync(proof.workDir, { recursive: true, force: true });
      expect(existsSync(proof.workDir)).toBe(false);
    }
  });
});

describe('platform-d1-b2-recovery-proof runner', () => {
  it('disables without Production mutation', () => {
    const result = runPlatformD1B2RecoveryProof({
      env: { [DISABLE_ENV]: '1' },
      actorRole: 'test-runner',
    });
    expect(result.ok).toBe(true);
    expect(result.disabled).toBe(true);
    expect(result.productionMutation).toBe(false);
    expect(result.writeAttempts).toBe(0);
  });

  it('passes end-to-end isolated D1/B2 proof with docs and cleanup', () => {
    const result = runPlatformD1B2RecoveryProof({ actorRole: 'test-runner' });
    expect(result.disabled).toBe(false);
    expect(result.productionMutation).toBe(false);
    expect(result.writeAttempts).toBe(0);
    expect(result.sourceIssue).toBe('#2895');
    expect(result.parentProject).toBe('#2779');
    expect(result.cleanupVerified).toBe(true);
    expect(result.d1?.withinRto).toBe(true);
    expect(result.b2?.withinRto).toBe(true);
    expect(result.b2?.reconcile.ok).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.summary.recommendation).toBe('D1_B2_ISOLATED_RECOVERY_PROOF_READY_FOR_REVIEW');
    expect(result.limitations.length).toBeGreaterThanOrEqual(3);
  });

  it('refuses when Production restore force flag is set', () => {
    const result = runPlatformD1B2RecoveryProof({
      env: { LGFC_FORCE_PRODUCTION_D1_RESTORE: 'true' },
      actorRole: 'test-runner',
    });
    expect(result.ok).toBe(false);
    expect(result.productionMutation).toBe(false);
    expect(result.summary.blockingFailures).toEqual(
      expect.arrayContaining(['protected_stop_no_production_restore']),
    );
  });
});
