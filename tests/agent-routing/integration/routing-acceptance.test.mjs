import { describe, expect, it } from 'vitest';
import { runAcceptanceScenarios } from '../../../scripts/agent-routing/acceptance.mjs';

describe('Project 2294 integrated acceptance', () => {
  it('passes all required deterministic safety scenarios', () => {
    const report = runAcceptanceScenarios({ now: '2026-07-17T17:00:00Z' });
    expect(report.ok).toBe(true);
    expect(report.scenarios).toHaveLength(21);
    expect(report.scenarios.every((scenario) => scenario.ok)).toBe(true);
    expect(report.invariants.noOpenAIApi).toBe(true);
    expect(report.invariants.noAutomaticMainMerge).toBe(true);
    expect(report.invariants.observeByDefault).toBe(true);
    expect(report.invariants.fourLaneConfigGated).toBe(true);
  });
});
