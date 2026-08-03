import { describe, expect, it } from 'vitest';
import {
  buildSyntheticCommunicationsRecord,
  isSha40,
  isToolingDisabled,
  parseWranglerConfig,
  proveSourceConfigReconstruction,
  RECONSTRUCT_PATHS,
  runPlatformRecoveryRollbackIntegratedDr,
  runReturnToServiceChecks,
  selectRollbackTarget,
} from '../scripts/ci/platform-recovery-rollback-integrated-dr.mjs';

describe('platform-recovery-rollback-integrated-dr helpers', () => {
  it('recognizes disable env', () => {
    expect(
      isToolingDisabled({ LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED: '1' }),
    ).toBe(true);
    expect(isToolingDisabled({})).toBe(false);
  });

  it('validates sha40 and selects distinct rollback target', () => {
    expect(isSha40('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')).toBe(true);
    expect(isSha40('short')).toBe(false);
    const result = selectRollbackTarget({
      currentFailedCandidate: {
        gitSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        deploymentId: 'failed-1',
      },
      lastKnownGoodCandidate: {
        gitSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        deploymentId: 'good-1',
        pagesProject: 'syn',
      },
    });
    expect(result.ok).toBe(true);
    expect(result.target.gitSha).toBe('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    expect(result.target.productionMutation).toBe(false);
  });

  it('rejects malformed failed-candidate identities', () => {
    const result = selectRollbackTarget({
      currentFailedCandidate: {
        gitSha: 'not-a-sha',
        deploymentId: 'failed-1',
      },
      lastKnownGoodCandidate: {
        gitSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        deploymentId: 'good-1',
        pagesProject: 'syn',
      },
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid_failed_candidate_identity');
  });

  it('rejects non-distinct candidate identities', () => {
    const result = selectRollbackTarget({
      currentFailedCandidate: {
        gitSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        deploymentId: 'same',
      },
      lastKnownGoodCandidate: {
        gitSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        deploymentId: 'same',
        pagesProject: 'syn',
      },
    });
    expect(result.ok).toBe(false);
  });

  it('parses wrangler markers offline and ignores comments/whitespace variants', () => {
    const text = `
pages_build_output_dir="./out"
# binding = "DB"
binding="DB"
database_name = "lgfc_lite"
database_id = "22d0dc3e-ad34-43af-8e6a-2063df1a1e04"
`;
    const parsed = parseWranglerConfig(text);
    expect(parsed.ok).toBe(true);
    expect(parsed.binding).toBe('DB');
    expect(parsed.pagesBuildOutputDir).toBe('./out');

    const commentedOnly = `
# pages_build_output_dir = "./out"
# binding = "DB"
# database_name = "lgfc_lite"
# database_id = "22d0dc3e-ad34-43af-8e6a-2063df1a1e04"
`;
    expect(parseWranglerConfig(commentedOnly).ok).toBe(false);
  });

  it('reconstructs source/config paths from repository tree', () => {
    const result = proveSourceConfigReconstruction();
    expect(RECONSTRUCT_PATHS.length).toBeGreaterThanOrEqual(10);
    expect(result.ok).toBe(true);
    expect(result.workflowCount).toBeGreaterThan(0);
    expect(result.migrationCount).toBeGreaterThan(0);
    expect(result.configFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it('builds redacted communications and return-to-service checks', () => {
    const comms = buildSyntheticCommunicationsRecord({
      scenarioId: 'SYN-DR-TEST',
      candidateSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      deploymentId: 'good-1',
      phaseResults: [{ id: 'detect', ok: true }],
    });
    expect(comms.ok).toBe(true);
    expect(comms.body).toContain('productionMutation=false');

    const reconstruct = proveSourceConfigReconstruction();
    const rollback = selectRollbackTarget({
      currentFailedCandidate: {
        gitSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        deploymentId: 'failed-1',
      },
      lastKnownGoodCandidate: {
        gitSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        deploymentId: 'good-1',
        pagesProject: 'syn',
      },
    });
    const rts = runReturnToServiceChecks({
      candidate: {
        returnToServiceChecks: [
          'home_route_smoke',
          'health_or_static_export_present',
          'wrangler_binding_names_intact',
          'no_secret_values_in_evidence',
        ],
      },
      reconstruct,
      rollback,
      evidenceTexts: [comms.body, JSON.stringify(rollback.target)],
    });
    expect(rts.ok).toBe(true);

    const leaked = runReturnToServiceChecks({
      candidate: { returnToServiceChecks: ['no_secret_values_in_evidence'] },
      reconstruct,
      rollback,
      evidenceTexts: ['api_token=super-secret-value'],
    });
    expect(leaked.ok).toBe(false);
  });
});

describe('platform-recovery-rollback-integrated-dr runner', () => {
  it('disables without Production mutation', () => {
    const result = runPlatformRecoveryRollbackIntegratedDr({
      env: { LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED: '1' },
      actorRole: 'test-runner',
    });
    expect(result.ok).toBe(true);
    expect(result.disabled).toBe(true);
    expect(result.productionMutation).toBe(false);
    expect(result.writeAttempts).toBe(0);
  });

  it('fail-closes on Production force flags', () => {
    const result = runPlatformRecoveryRollbackIntegratedDr({
      env: { LGFC_FORCE_PRODUCTION_ROLLBACK: '1' },
      actorRole: 'test-runner',
    });
    expect(result.ok).toBe(false);
    expect(result.productionMutation).toBe(false);
    expect(result.summary.recommendation).toBe(
      'ROLLBACK_INTEGRATED_DR_BLOCKED_PROTECTED_STOP',
    );
  });

  it('fails when nested isolation is skipped', () => {
    const result = runPlatformRecoveryRollbackIntegratedDr({
      actorRole: 'test-runner',
      includeNestedIsolation: false,
    });
    expect(result.ok).toBe(false);
    expect(result.nestedIsolation.skipped).toBe(true);
  });

  it('passes rollback + integrated DR with fixtures', () => {
    const result = runPlatformRecoveryRollbackIntegratedDr({
      actorRole: 'test-runner',
    });
    expect(result.disabled).toBe(false);
    expect(result.productionMutation).toBe(false);
    expect(result.sourceIssue).toBe('#2896');
    expect(result.parentProject).toBe('#2779');
    expect(result.cleanupOk).toBe(true);
    expect(result.ok).toBe(true);
    expect(result.summary.recommendation).toBe(
      'ROLLBACK_INTEGRATED_DR_PROOF_READY_FOR_REVIEW',
    );
    expect(result.candidate.gitSha).toBe('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    expect(result.nestedIsolation.ok).toBe(true);
    expect(result.nestedIsolation.skipped).toBe(false);
    expect(result.returnToService.ok).toBe(true);
    expect(result.phaseResults.every((p) => p.ok)).toBe(true);
    expect(result.limitations.length).toBeGreaterThan(0);
  });
});
