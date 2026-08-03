import { describe, expect, it } from 'vitest';
import {
  ALLOWED_TESTED_STATUS,
  isToolingDisabled,
  PROTECTED_DECISIONS,
  RECOVERY_ASSETS,
  REQUIRED_CLASSES,
  runPlatformRecoveryInventory,
  validateAsset,
} from '../scripts/ci/platform-recovery-inventory.mjs';

describe('platform-recovery-inventory helpers', () => {
  it('covers required recovery classes with complete zero-cost assets', () => {
    const classes = new Set(RECOVERY_ASSETS.map((a) => a.class));
    for (const c of REQUIRED_CLASSES) {
      expect(classes.has(c), c).toBe(true);
    }
    expect(RECOVERY_ASSETS.length).toBeGreaterThanOrEqual(10);
    for (const asset of RECOVERY_ASSETS) {
      const r = validateAsset(asset);
      expect(r.ok, asset.id).toBe(true);
      expect(ALLOWED_TESTED_STATUS).toContain(asset.testedStatus);
      expect(asset.zeroCostBaseline).toBe(true);
    }
  });

  it('records protected decisions including deferred credentials and zero-cost', () => {
    const ids = PROTECTED_DECISIONS.map((d) => d.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'no_production_restore',
        'no_secret_values',
        'zero_cost_baseline',
        'credentialed_live_deferred',
        'production_go_separate',
      ]),
    );
  });

  it('recognizes disable env', () => {
    expect(isToolingDisabled({ LGFC_PLATFORM_RECOVERY_INVENTORY_DISABLED: '1' })).toBe(true);
    expect(isToolingDisabled({})).toBe(false);
  });
});

describe('platform-recovery-inventory runner', () => {
  it('disables without Production mutation', () => {
    const result = runPlatformRecoveryInventory({
      env: { LGFC_PLATFORM_RECOVERY_INVENTORY_DISABLED: '1' },
      actorRole: 'test-runner',
    });
    expect(result.ok).toBe(true);
    expect(result.disabled).toBe(true);
    expect(result.productionMutation).toBe(false);
    expect(result.writeAttempts).toBe(0);
  });

  it('passes inventory structure check with docs present', () => {
    const result = runPlatformRecoveryInventory({ actorRole: 'test-runner' });
    expect(result.disabled).toBe(false);
    expect(result.productionMutation).toBe(false);
    expect(result.writeAttempts).toBe(0);
    expect(result.sourceIssue).toBe('#2894');
    expect(result.parentProject).toBe('#2779');
    expect(result.summary.zeroCostBaseline).toBe(true);
    expect(result.summary.productionMutation).toBe('not_authorized');
    expect(result.ok).toBe(true);
    expect(result.summary.recommendation).toBe('RECOVERY_INVENTORY_READY_FOR_REVIEW');
  });
});
