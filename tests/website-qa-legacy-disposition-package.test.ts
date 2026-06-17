import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Task 008 disposition package path. */
export const LEGACY_DISPOSITION_PACKAGE_PATH =
  'docs/ops/reports/website-qa-production-validation-legacy-disposition-package.md';

/** Planning reconciliation artifact superseded by Task 008 package. */
export const LEGACY_RECONCILIATION_PATH =
  'docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md';

/** Phase 4 verification PRs referenced by the disposition package (Tasks 002–007). */
export const PHASE4_VERIFICATION_PRS = ['#1662', '#1667', '#1672', '#1684', '#1728', '#1737'] as const;

/** Public-core legacy issues covered by Task 008 disposition comments. */
export const LEGACY_DISPOSITION_ISSUE_IDS = [
  '#1053',
  '#943',
  '#946',
  '#947',
  '#1013',
  '#1014',
  '#1015',
  '#1016',
  '#1017',
  '#1108',
  '#1109',
  '#1110',
  '#1111',
  '#1112',
] as const;

function readSource(path: string): string {
  expect(existsSync(path), `Missing file: ${path}`).toBe(true);
  return readFileSync(path, 'utf8');
}

describe('website QA legacy disposition package (#1259 Task 008)', () => {
  it('ships the Task 008 legacy disposition package report', () => {
    const source = readSource(LEGACY_DISPOSITION_PACKAGE_PATH);
    expect(source).toContain('Task 008');
    expect(source).toContain('Legacy Disposition Package');
    expect(source).toMatch(/does not.*execute GitHub mutations/i);
  });

  it('references the Phase 3 reconciliation artifact', () => {
    readSource(LEGACY_RECONCILIATION_PATH);
    const report = readSource(LEGACY_DISPOSITION_PACKAGE_PATH);
    expect(report).toContain(LEGACY_RECONCILIATION_PATH);
  });

  it('includes copy-paste disposition sections for every legacy issue', () => {
    const report = readSource(LEGACY_DISPOSITION_PACKAGE_PATH);
    for (const issueId of LEGACY_DISPOSITION_ISSUE_IDS) {
      expect(report, `Missing disposition section for ${issueId}`).toContain(`### ${issueId}`);
      expect(report, `Missing comment block for ${issueId}`).toContain(
        `## #1259 disposition`,
      );
    }
  });

  it('maps Phase 4 verification evidence for satisfied lanes', () => {
    const report = readSource(LEGACY_DISPOSITION_PACKAGE_PATH);
    for (const pr of PHASE4_VERIFICATION_PRS) {
      expect(report, `Missing Phase 4 PR reference ${pr}`).toContain(pr);
    }
  });

  it('preserves Task 007 bounded deferral for #1112 T50', () => {
    const report = readSource(LEGACY_DISPOSITION_PACKAGE_PATH);
    const task007 = readSource(
      'docs/ops/reports/website-qa-production-validation-launch-readiness-h011-disposition.md',
    );
    expect(task007).toContain('bounded deferral');
    expect(report).toContain('#1112');
    expect(report).toContain('partially satisfied');
    expect(report).toContain('H-011');
    expect(report).toContain('552fb8f');
  });

  it('records do-not-close guidance for umbrella #1259', () => {
    const report = readSource(LEGACY_DISPOSITION_PACKAGE_PATH);
    expect(report).toMatch(/do not close.*#1259/i);
  });
});
