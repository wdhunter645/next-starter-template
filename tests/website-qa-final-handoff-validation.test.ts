import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Phase 4 validation deliverables on `main` (#1259 Tasks 001–007). */
export const PHASE4_VALIDATION_DELIVERABLES = [
  {
    task: '001',
    title: 'As-built inventory and gap analysis',
    report: 'docs/ops/reports/website-qa-production-validation-as-built-gap-analysis.md',
    pr: '#1657',
    mergeSha: 'da02c01',
  },
  {
    task: '002',
    title: 'Route and navigation validation',
    report: 'docs/ops/reports/website-qa-production-validation-route-nav-validation.md',
    pr: '#1662',
    mergeSha: '2e811a6',
  },
  {
    task: '003',
    title: 'Auth-state validation',
    report: 'docs/ops/reports/website-qa-production-validation-auth-state-validation.md',
    pr: '#1667',
    mergeSha: '0347b27',
  },
  {
    task: '004',
    title: 'Mobile and responsive validation',
    report: 'docs/ops/reports/website-qa-production-validation-mobile-responsive-validation.md',
    pr: '#1672',
    mergeSha: '5e10f72',
  },
  {
    task: '005',
    title: 'D1 and B2 public read-path verification',
    report: 'docs/ops/reports/website-qa-production-validation-d1-b2-read-path-validation.md',
    pr: '#1684',
    mergeSha: '8893591',
  },
  {
    task: '006',
    title: 'Content inventory public surface validation',
    report: 'docs/ops/reports/website-qa-production-validation-content-inventory-public-surface-validation.md',
    pr: '#1728',
    mergeSha: 'c170d3c',
  },
  {
    task: '007',
    title: 'Launch-readiness H-011 disposition',
    report: 'docs/ops/reports/website-qa-production-validation-launch-readiness-h011-disposition.md',
    pr: '#1737',
    mergeSha: '552fb8f',
  },
] as const;

/** Task 009 final report path. */
export const FINAL_QA_REPORT_PATH =
  'docs/ops/reports/website-qa-production-validation-final-qa-handoff.md';

/** Supporting planning artifact referenced by Task 008/009. */
export const LEGACY_RECONCILIATION_PATH =
  'docs/ops/reports/website-qa-production-validation-legacy-issue-reconciliation.md';

/** Accepted deferrals and residual hygiene documented in final handoff / closeout prep. */
export const OPEN_BLOCKER_IDS = [
  'h011-ci-schedule',
  'legacy-label-hygiene-residual',
  'cloudflare-preview-drift',
  'fanclub-pdf-upload-ops',
  'homepage-inventory-consumer',
] as const;

function readSource(path: string): string {
  expect(existsSync(path), `Missing file: ${path}`).toBe(true);
  return readFileSync(path, 'utf8');
}

describe('website QA final handoff contract (#1259 Task 009)', () => {
  it('ships the Task 009 final QA handoff report', () => {
    const source = readSource(FINAL_QA_REPORT_PATH);
    expect(source).toContain('Program #1255');
    expect(source).toContain('#1259');
    expect(source).toContain('Handoff status');
  });

  it('references every Phase 4 validation deliverable through Task 007', () => {
    const report = readSource(FINAL_QA_REPORT_PATH);
    const plan = readSource('docs/ops/implementation-plans/website-qa-production-validation.md');

    for (const entry of PHASE4_VALIDATION_DELIVERABLES) {
      readSource(entry.report);
      expect(report, `Final report missing task ${entry.task} reference`).toContain(entry.report);
      expect(plan, `Implementation plan missing task ${entry.task} complete line`).toMatch(
        new RegExp(`Task ${entry.task} complete`, 'i'),
      );
    }
  });

  it('classifies all documented open blockers in the final report', () => {
    const report = readSource(FINAL_QA_REPORT_PATH);
    for (const id of OPEN_BLOCKER_IDS) {
      expect(report, `Missing blocker classification: ${id}`).toContain(id);
    }
  });

  it('records Task 008 complete and closeout readiness guidance', () => {
    const report = readSource(FINAL_QA_REPORT_PATH);
    expect(report).toMatch(/do not close.*#1259/i);
    expect(report).toContain('#1255');
    expect(report).toContain('678699e');
    expect(report).toContain('program-1255-closeout-readiness.md');
    expect(report).toContain('legacy-label-hygiene-residual');
  });

  it('retains legacy reconciliation as supporting authority', () => {
    readSource(LEGACY_RECONCILIATION_PATH);
    const report = readSource(FINAL_QA_REPORT_PATH);
    expect(report).toContain(LEGACY_RECONCILIATION_PATH);
  });

  it('documents H-011 bounded deferral from Task 007', () => {
    const report = readSource(FINAL_QA_REPORT_PATH);
    const task007 = readSource(
      'docs/ops/reports/website-qa-production-validation-launch-readiness-h011-disposition.md',
    );
    expect(task007).toContain('bounded deferral');
    expect(report).toContain('h011-ci-schedule');
    expect(report).toContain('552fb8f');
  });
});
