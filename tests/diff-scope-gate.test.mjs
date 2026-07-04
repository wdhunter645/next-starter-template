import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  buildDiffScopeReport,
  renderDiffScopeReport,
  runCli,
  writeDiffScopeArtifacts,
} from '../scripts/ci/diff_scope_gate.mjs';

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
    expect(report.gate).toBe('diff-scope');
    expect(report.schemaVersion).toBe(1);
    expect(report.advisory).toBe(true);
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

  it('writes JSON and Markdown artifacts', () => {
    const jsonPath = 'diff-scope-result.test.json';
    const mdPath = 'diff-scope-result.test.md';
    const report = buildDiffScopeReport({
      body,
      changedFiles: ['scripts/ci/diff_scope_gate.mjs'],
    });

    try {
      writeDiffScopeArtifacts(report, {
        DIFF_SCOPE_RESULT_JSON: jsonPath,
        DIFF_SCOPE_RESULT_MD: mdPath,
      });

      expect(JSON.parse(fs.readFileSync(jsonPath, 'utf8'))).toMatchObject({
        gate: 'diff-scope',
        schemaVersion: 1,
        ok: true,
      });
      expect(fs.readFileSync(mdPath, 'utf8')).toContain('Diff Scope Gate');
    } finally {
      for (const file of [jsonPath, mdPath]) {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
    }
  });

  it('returns advisory exit code zero when enforcement is disabled', () => {
    const bodyPath = 'diff-scope-body.test.md';
    const changedPath = 'diff-scope-changed.test.txt';
    fs.writeFileSync(bodyPath, body);
    fs.writeFileSync(changedPath, 'src/app/page.tsx\n');

    try {
      expect(runCli({
        DIFF_SCOPE_BODY_FILE: bodyPath,
        DIFF_SCOPE_CHANGED_FILES_FILE: changedPath,
        DIFF_SCOPE_ENFORCE_FAILURE: 'false',
      })).toBe(0);

      expect(runCli({
        DIFF_SCOPE_BODY_FILE: bodyPath,
        DIFF_SCOPE_CHANGED_FILES_FILE: changedPath,
        DIFF_SCOPE_ENFORCE_FAILURE: 'true',
      })).toBe(1);
    } finally {
      for (const file of [bodyPath, changedPath]) {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }
    }
  });
});
