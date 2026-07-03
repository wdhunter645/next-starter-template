import { describe, expect, it } from 'vitest';
import {
  buildPrHygieneReport,
  extractMarkdownSection,
  findIssueReferences,
  hasRequiredIssueLine,
  parseAllowedFiles,
  parseIntentLabel,
  parsePrClass,
  renderPrHygieneReport,
  suggestCanonicalIssueLine,
} from '../scripts/ci/pr_hygiene_audit.mjs';

const stableBody = `# PR Summary

- **Issue:** #2178
- Intent label: intent:ci
- PR class: ci

## Scope

Allowed paths:
- \`scripts/ci/pr_hygiene_audit.mjs\`
- \`tests/**\`

Out-of-scope changes present: NO
Exception issue/approval if YES: not-applicable

## Change Summary

This PR rewrites PR hygiene so it validates only stable PR-body facts.

## Verification

Local verification:
- Command: \`npm test -- tests/pr-hygiene-audit.test.mjs\`
  Result: PASS

CI verification:
- Required checks expected to pass: YES
- Known failing/advisory checks: none

## Acceptance Criteria

- [x] Source issue acceptance criteria reviewed
- [x] Criteria complete, or a follow-up issue is linked below

Follow-up issue required: NO
Follow-up issue if required: not-applicable

## Reviewer / Bot Review Attestation

- [ ] I have read all human review threads on this PR
- [ ] I have read all bot/advisory findings on this PR
`;

const legacyBody = `- **Issue:** #1131

## MANDATORY FIRST STEP (ZIP SAFETY)
- [x] No ZIP file exists in the repo root.

## FILE-TOUCH ALLOWLIST (MANDATORY)
Allowed files:
- scripts/ci/**
- tests/**

All other files are out of scope
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

  it('extracts markdown sections case-insensitively', () => {
    expect(extractMarkdownSection(stableBody, 'change summary')).toContain('validates only stable PR-body facts');
    expect(extractMarkdownSection(stableBody, 'REVIEWER / BOT REVIEW ATTESTATION')).toContain('human review threads');
  });

  it('parses allowed paths from the stable PR body', () => {
    expect(parseAllowedFiles(stableBody)).toEqual(['scripts/ci/pr_hygiene_audit.mjs', 'tests/**']);
  });

  it('keeps backward-compatible parsing for legacy Allowed files anchors', () => {
    expect(parseAllowedFiles(legacyBody)).toEqual(['scripts/ci/**', 'tests/**']);
  });

  it('parses stable intent label and PR class', () => {
    expect(parseIntentLabel(stableBody)).toBe('intent:ci');
    expect(parsePrClass(stableBody)).toBe('ci');
  });

  it('reports clean PR hygiene when stable body fields and allowlist are present', () => {
    const report = buildPrHygieneReport({
      body: stableBody,
      changedFiles: ['scripts/ci/pr_hygiene_audit.mjs', 'tests/pr-hygiene-audit.test.mjs'],
    });

    expect(report.isClean).toBe(true);
    expect(report.unlistedChangedFiles).toEqual([]);
    expect(report.missingSections).toEqual([]);
    expect(report.hasRequiredPrClass).toBe(true);
    expect(report.hasRequiredIntentLabel).toBe(true);
  });

  it('does not require retired lifecycle-database sections', () => {
    const report = buildPrHygieneReport({
      body: stableBody,
      changedFiles: ['scripts/ci/pr_hygiene_audit.mjs'],
    });

    expect(report.missingSections).not.toContain('MANDATORY FIRST STEP (ZIP SAFETY)');
    expect(report.missingSections).not.toContain('REVIEWER RESPONSE ACCOUNTING');
    expect(report.missingSections).not.toContain('REQUIRED PRE-REVIEW SELF-CHECK');
  });

  it('reports missing stable fields and unlisted changed files', () => {
    const report = buildPrHygieneReport({
      body: 'Closes #1131\n\n## Scope\nAllowed paths:\n- docs/**',
      changedFiles: ['scripts/ci/pr_hygiene_audit.mjs'],
    });

    expect(report.isClean).toBe(false);
    expect(report.hasRequiredIssueLine).toBe(false);
    expect(report.suggestedIssueLine).toBe('- **Issue:** #1131');
    expect(report.missingSections).toContain('PR Summary');
    expect(report.missingSections).toContain('Change Summary');
    expect(report.unlistedChangedFiles).toEqual(['scripts/ci/pr_hygiene_audit.mjs']);
  });

  it('renders actionable stable-body remediation text', () => {
    const report = buildPrHygieneReport({
      body: 'Closes #1131',
      changedFiles: ['scripts/ci/pr_hygiene_audit.mjs'],
    });

    const rendered = renderPrHygieneReport(report);
    expect(rendered).toContain('Missing canonical source issue line');
    expect(rendered).toContain('Suggested correction');
    expect(rendered).toContain('Missing stable `Intent label:`');
    expect(rendered).toContain('Changed files not covered');
  });
});
