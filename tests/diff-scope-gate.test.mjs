import { describe, expect, it } from 'vitest';
import { buildDiffScopeReport, renderDiffScopeReport } from '../scripts/ci/diff_scope_gate.mjs';

const body = `# PR Summary

- **Issue:** #2180
- Intent label: intent:ci
- PR class: ci

## Scope

Allowed paths:
- \`scripts/ci/**\`
- \`tests/diff-scope-gate.test.mjs\`

Out-of-scope changes present: NO
`;

describe('diff scope gate', () => {
  it('passes when every changed file is covered by allowed paths', () => {
    const report = buildDiffScopeReport({
      body,
      changedFiles: ['scripts/ci/diff_scope_gate.mjs', 'tests/diff-scope-gate.test.mjs'],
    });

    expect(report.ok).toBe(true);
    expect(report.unlistedChangedFiles).toEqual([]);
  });

  it('fails when a changed file is outside allowed paths', () => {
    const report = buildDiffScopeReport({
      body,
      changedFiles: ['scripts/ci/diff_scope_gate.mjs', 'src/app/page.tsx'],
    });

    expect(report.ok).toBe(false);
    expect(report.unlistedChangedFiles).toEqual(['src/app/page.tsx']);
  });

  it('fails when allowed paths are missing', () => {
    const report = buildDiffScopeReport({
      body: '# PR Summary\n\n- **Issue:** #2180',
      changedFiles: ['scripts/ci/diff_scope_gate.mjs'],
    });

    expect(report.ok).toBe(false);
    expect(report.hasAllowedFiles).toBe(false);
  });

  it('renders actionable failure text', () => {
    const report = buildDiffScopeReport({
      body,
      changedFiles: ['src/app/page.tsx'],
    });

    const rendered = renderDiffScopeReport(report);
    expect(rendered).toContain('Changed files outside declared');
    expect(rendered).toContain('src/app/page.tsx');
  });
});
