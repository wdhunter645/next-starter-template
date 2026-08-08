import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Contract for #2858 Task 005 / #3197 — project audit + promotion readiness packet.
 */
const AUDIT_REPORT = 'docs/ops/reports/fanclub-responsive-project-audit-2858.md';
const HANDOFF_REPORT = 'docs/ops/reports/fanclub-responsive-qualification-handoff-2905.md';

const CHILD_MARKERS = ['#2902', '#2903', '#2904', '#2905', '#3187', '#3191', '#3192', '#3196'] as const;

describe('fanclub responsive project audit (#3197 / #2858-005)', () => {
  it('ships the project audit and Promotion Candidate readiness report', () => {
    expect(existsSync(AUDIT_REPORT)).toBe(true);
    const report = readFileSync(AUDIT_REPORT, 'utf8');
    expect(report).toContain('#3197');
    expect(report).toContain('#2858');
    expect(report).toContain('component/fanclub-responsive-completion');
    expect(report).toContain('Promotion Candidate readiness');
    expect(report).toContain('No-Go for Production');
  });

  it('reconciles child map 001–004 with PR and issue markers', () => {
    const report = readFileSync(AUDIT_REPORT, 'utf8');
    for (const marker of CHILD_MARKERS) {
      expect(report).toContain(marker);
    }
  });

  it('records open #2857/#2860 exceptions and independent audit requirement', () => {
    const report = readFileSync(AUDIT_REPORT, 'utf8');
    expect(report).toContain('#2857');
    expect(report).toContain('#2860');
    expect(report).toContain('Independent project/master ACCEPT');
    expect(report).toContain('#2776');
  });

  it('records deferred main sync identity for #3142 tip', () => {
    const report = readFileSync(AUDIT_REPORT, 'utf8');
    expect(report).toContain('0aa31939');
    expect(report).toContain('#3142');
    expect(report).toMatch(/Deferred/i);
    expect(report).toContain('protected-change-review');
  });

  it('points rollback authority at the #2905 handoff report', () => {
    expect(existsSync(HANDOFF_REPORT)).toBe(true);
    const report = readFileSync(AUDIT_REPORT, 'utf8');
    expect(report).toContain(HANDOFF_REPORT);
  });
});
