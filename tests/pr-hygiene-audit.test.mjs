import { describe, expect, it } from 'vitest';
import {
  buildPrHygieneReport,
  findIssueReferences,
  hasRequiredIssueLine,
  hasZipSafetyStatement,
  parseAllowedFiles,
  renderPrHygieneReport,
  suggestCanonicalIssueLine,
} from '../scripts/ci/pr_hygiene_audit.mjs';

const validBody = `- **Issue:** #1131

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root.

## DESIGN SOURCE OF TRUTH (NON-NEGOTIABLE)
- Canonical process reference: /docs/governance/PR_PROCESS.md

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- scripts/ci/**
- tests/**

All other files are out of scope

## VISUAL / UX INVARIANTS (MANDATORY)
- [x] No unauthorized visual drift introduced.

## REQUIRED PRE-REVIEW SELF-CHECK
- [x] PR body contains all required sections with exact headings.
`;

describe('PR hygiene audit foundation', () => {
  it('detects canonical source issue syntax', () => {
    expect(hasRequiredIssueLine('- **Issue:** #1131')).toBe(true);
    expect(hasRequiredIssueLine('Closes #1131')).toBe(false);
  });

  it('extracts issue references and suggests a canonical issue line', () => {
    expect(findIssueReferences('Closes #1131')).toEqual([1131]);
    expect(suggestCanonicalIssueLine('Closes #1131')).toBe('- **Issue:** #1131');
    expect(suggestCanonicalIssueLine('Refs #1131 and #1075')).toBe('');
  });

  it('detects ZIP safety statements', () => {
    expect(hasZipSafetyStatement('- [x] No ZIP file exists in the repo root.')).toBe(true);
    expect(hasZipSafetyStatement('No archive attached.')).toBe(false);
  });

  it('parses allowed files from the PR body', () => {
    expect(parseAllowedFiles(validBody)).toEqual(['scripts/ci/**', 'tests/**']);
  });

  it('reports clean PR hygiene when required body and allowlist are present', () => {
    const report = buildPrHygieneReport({
      body: validBody,
      changedFiles: ['scripts/ci/pr_hygiene_audit.mjs', 'tests/pr-hygiene-audit.test.mjs'],
    });

    expect(report.isClean).toBe(true);
    expect(report.unlistedChangedFiles).toEqual([]);
    expect(report.missingSections).toEqual([]);
  });

  it('reports missing issue syntax, missing sections, and unlisted changed files', () => {
    const report = buildPrHygieneReport({
      body: 'Closes #1131\n\nAllowed files:\n- docs/**',
      changedFiles: ['scripts/ci/pr_hygiene_audit.mjs'],
    });

    expect(report.isClean).toBe(false);
    expect(report.hasRequiredIssueLine).toBe(false);
    expect(report.suggestedIssueLine).toBe('- **Issue:** #1131');
    expect(report.missingSections).toContain('MANDATORY FIRST STEP (ZIP SAFETY)');
    expect(report.unlistedChangedFiles).toEqual(['scripts/ci/pr_hygiene_audit.mjs']);
  });

  it('renders actionable remediation text', () => {
    const report = buildPrHygieneReport({
      body: 'Closes #1131',
      changedFiles: ['scripts/ci/pr_hygiene_audit.mjs'],
    });

    const rendered = renderPrHygieneReport(report);
    expect(rendered).toContain('Missing canonical source issue line');
    expect(rendered).toContain('Suggested correction');
    expect(rendered).toContain('Changed files not covered');
  });
});
