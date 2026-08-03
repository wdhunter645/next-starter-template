import { describe, expect, it } from 'vitest';
import {
  assertQualificationFixture,
  detectForcedProduction,
  isToolingDisabled,
  runPlatformRecoveryDay2Qualify,
  REQUIRED_HANDOFF_MARKERS,
} from '../scripts/ci/platform-recovery-day2-qualify.mjs';

describe('platform-recovery-day2-qualify', () => {
  it('recognizes disable env', () => {
    expect(isToolingDisabled({ LGFC_PLATFORM_RECOVERY_DAY2_QUALIFY_DISABLED: '1' })).toBe(true);
    expect(isToolingDisabled({})).toBe(false);
  });

  it('detects production force flags', () => {
    expect(detectForcedProduction({ LGFC_FORCE_PRODUCTION_RECOVERY_ACTIVATION: '1' })).toEqual([
      'LGFC_FORCE_PRODUCTION_RECOVERY_ACTIVATION',
    ]);
    expect(detectForcedProduction({})).toEqual([]);
  });

  it('requires production authorization flags to be false in fixture', () => {
    const bad = assertQualificationFixture({
      schema_version: 1,
      source_issue: '#2897',
      parent_project: '#2779',
      production_activation_authorized: true,
      production_merge_authorized: false,
      predecessor_tasks: ['#2894', '#2895', '#2896'],
      exceptions: ['x'],
      exercise_cadence: { synthetic: 'a', live_deferred: 'b' },
      activation_authority: { day2: 'd', product_authority: 'p' },
      evidence_retention: { minimum_days: 90 },
    });
    expect(bad.ok).toBe(false);
    expect(bad.errors).toContain('fixture_production_activation_must_be_false');
  });

  it('qualifies the repository package without Production authorization', () => {
    const result = runPlatformRecoveryDay2Qualify();
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.productionActivationAuthorized).toBe(false);
    expect(result.productionMergeAuthorized).toBe(false);
    expect(REQUIRED_HANDOFF_MARKERS.length).toBeGreaterThan(5);
  });

  it('fails closed when a Production force flag is set', () => {
    const result = runPlatformRecoveryDay2Qualify({
      env: { LGFC_FORCE_PRODUCTION_DR: '1' },
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('production_force_flag_set');
  });

  it('skips cleanly when disabled', () => {
    const result = runPlatformRecoveryDay2Qualify({
      env: { LGFC_PLATFORM_RECOVERY_DAY2_QUALIFY_DISABLED: '1' },
    });
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
  });
});
