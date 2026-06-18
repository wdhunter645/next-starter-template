import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

export const CLOSEOUT_READINESS_PATH = 'docs/ops/reports/program-1255-closeout-readiness.md';

/** Operator hygiene targets documented in closeout readiness packet. */
export const OPERATOR_HYGIENE_ISSUES = ['1123', '1258'] as const;

/** Issues that must remain open pending terminal closeout. */
export const PENDING_TERMINAL_CLOSE_ISSUES = ['1255', '1259'] as const;

describe('Program #1255 closeout readiness packet', () => {
  it('ships the closeout readiness report', () => {
    expect(existsSync(CLOSEOUT_READINESS_PATH)).toBe(true);
    const source = readFileSync(CLOSEOUT_READINESS_PATH, 'utf8');
    expect(source).toContain('Program #1255');
    expect(source).toContain('#1259');
    expect(source).toContain('Atlas/Bill final inspection checklist');
  });

  it('documents operator hygiene targets and completion status', () => {
    const source = readFileSync(CLOSEOUT_READINESS_PATH, 'utf8');
    for (const issue of OPERATOR_HYGIENE_ISSUES) {
      expect(source).toContain(`#${issue}`);
    }
    expect(source).toContain('Operator hygiene **complete**');
  });

  it('documents do-not-close guidance for umbrella and QA project', () => {
    const source = readFileSync(CLOSEOUT_READINESS_PATH, 'utf8');
    for (const issue of PENDING_TERMINAL_CLOSE_ISSUES) {
      expect(source).toMatch(new RegExp(`#${issue}`));
    }
    expect(source).toMatch(/not.*close.*#1259/i);
  });

  it('references final QA handoff as primary validation evidence', () => {
    const source = readFileSync(CLOSEOUT_READINESS_PATH, 'utf8');
    expect(source).toContain('website-qa-production-validation-final-qa-handoff.md');
    expect(source).toContain('fd17af2');
  });
});
