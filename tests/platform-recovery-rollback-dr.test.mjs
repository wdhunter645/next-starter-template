import { describe, expect, it } from 'vitest';
import {
  dryRunRollbackProcedure,
  evaluateStopConditions,
  isToolingDisabled,
  reconstructCandidate,
  runPlatformRecoveryRollbackDr,
  selectImmutableCandidate,
  walkDecisionPath,
} from '../scripts/ci/platform-recovery-rollback-dr.mjs';

describe('platform-recovery-rollback-dr helpers', () => {
  it('recognizes disable env', () => {
    expect(isToolingDisabled({ LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED: '1' })).toBe(true);
    expect(isToolingDisabled({})).toBe(false);
  });

  it('selects an immutable candidate SHA', () => {
    const c = selectImmutableCandidate();
    expect(c.ok).toBe(true);
    expect(c.sha).toMatch(/^[0-9a-f]{40}$/i);
  });

  it('reconstructs required paths at HEAD', () => {
    const sha = selectImmutableCandidate().sha;
    const r = reconstructCandidate(sha, ['package.json', 'wrangler.toml']);
    expect(r.ok).toBe(true);
    expect(r.missing).toEqual([]);
  });

  it('dry-runs rollback procedure signals from sample runbooks', () => {
    const pad = 'x'.repeat(80);
    const texts = {
      a: `Rollback by redeploying the last known-good commit. Verify smoke tests. Stop for Bill approval. ${pad}`,
      b: `Emergency recovery is stabilization-first. Obtain Chat approval before production-affecting actions. ${pad}`,
    };
    const r = dryRunRollbackProcedure(texts);
    expect(r.ok).toBe(true);
  });

  it('honors stop dispositions and forbids production outage', () => {
    const r = evaluateStopConditions(
      [
        { id: 'production_mutation_attempt', expectedDisposition: 'STOP' },
        { id: 'secret_value_in_evidence', expectedDisposition: 'STOP' },
      ],
      {
        attemptedHazards: ['production_mutation_attempt', 'secret_value_in_evidence'],
        productionOutageInduced: false,
      },
    );
    expect(r.ok).toBe(true);
  });

  it('requires ordered decision path completion', () => {
    const path = ['a', 'b', 'c'];
    expect(walkDecisionPath(path, ['a', 'b', 'c']).ok).toBe(true);
    expect(walkDecisionPath(path, ['a', 'c', 'b']).ok).toBe(false);
    expect(walkDecisionPath(path, ['a', 'b']).ok).toBe(false);
  });
});

describe('platform-recovery-rollback-dr runner', () => {
  it('disables without Production mutation or outage', () => {
    const result = runPlatformRecoveryRollbackDr({
      env: { LGFC_PLATFORM_RECOVERY_ROLLBACK_DR_DISABLED: '1' },
      actorRole: 'test-runner',
    });
    expect(result.ok).toBe(true);
    expect(result.disabled).toBe(true);
    expect(result.productionMutation).toBe(false);
    expect(result.productionOutageInduced).toBe(false);
    expect(result.writeAttempts).toBe(0);
  });

  it('passes rollback and synthetic DR proof with fixtures', () => {
    const result = runPlatformRecoveryRollbackDr({ actorRole: 'test-runner' });
    expect(result.disabled).toBe(false);
    expect(result.productionMutation).toBe(false);
    expect(result.productionOutageInduced).toBe(false);
    expect(result.sourceIssue).toBe('#2896');
    expect(result.parentProject).toBe('#2779');
    expect(result.cleanupOk).toBe(true);
    expect(result.candidateSha).toMatch(/^[0-9a-f]{40}$/i);
    expect(result.ok).toBe(true);
    expect(result.summary.recommendation).toBe('ROLLBACK_DR_PROOF_READY_FOR_REVIEW');
    expect(result.limitations.length).toBeGreaterThan(0);
  });
});
