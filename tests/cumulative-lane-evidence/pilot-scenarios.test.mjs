import { describe, expect, it } from 'vitest';
import {
  CANDIDATE_SHA,
  runPilotScenarios,
  summarizePilotScenarios,
} from '../../scripts/cumulative-lane-evidence/pilot-scenarios.mjs';

describe('promotion candidate pilot scenarios (#2885)', () => {
  it('binds qualification to the integrated implementation baseline SHA', () => {
    expect(CANDIDATE_SHA).toBe('f03ba72586ad98379cdaf3ba708c3d9a4b762fda');
  });

  it('passes every project acceptance scenario', () => {
    const summary = summarizePilotScenarios(runPilotScenarios());
    expect(summary.failed).toEqual([]);
    expect(summary.ok).toBe(true);
    expect(summary.total).toBe(6);
    expect(summary.passed).toBe(6);
  });

  it('covers progression, return, protected-stop, missing-evidence, supersession, rollback', () => {
    const names = runPilotScenarios().map((r) => r.name).sort();
    expect(names).toEqual([
      'missing_evidence_blocks_exit_not_in_lane',
      'progression_sandbox_development_promotion',
      'protected_stop_blocks_exit',
      'return_to_development',
      'rollback_preserves_history',
      'supersession_correction',
    ]);
  });
});
