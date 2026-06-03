import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  MERGE_PROTECTION_SURFACE,
  RETIRED_MERGE_PROTECTION_WORKFLOWS,
  renderBranchProtectionChecklist,
  validateMergeProtectionSurface,
} from '../scripts/ci/merge_protection_surface.mjs';

const tempDirs = [];

function makeTempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lgfc-merge-protection-'));
  tempDirs.push(root);
  fs.mkdirSync(path.join(root, '.github', 'workflows'), { recursive: true });
  return root;
}

afterEach(() => {
  while (tempDirs.length) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

describe('merge protection surface inventory', () => {
  it('validates the repository merge-protection workflow surface', () => {
    const result = validateMergeProtectionSurface();
    expect(result.ok, result.errors.join('\n')).toBe(true);
  });

  it('documents retired duplicate ZIP workflow removal', () => {
    expect(RETIRED_MERGE_PROTECTION_WORKFLOWS).toContain('gate-zip-safety.yml');
  });

  it('keeps deterministic merge blockers on the consolidated surface', () => {
    const files = MERGE_PROTECTION_SURFACE.map((entry) => entry.file);
    expect(files).toEqual([
      'gate-quality.yml',
      'gitleaks.yml',
      'ops-pr-issue-accounting.yml',
    ]);
  });

  it('uses the provided validation root when checking workflow contents', () => {
    const root = makeTempRoot();
    fs.writeFileSync(path.join(root, '.github/workflows/gate-quality.yml'), [
      'name: GATE — Quality Checks',
      'jobs:',
      '  quality:',
      '    steps:',
      '      - run: npm run build',
      '      - run: bash scripts/ci/check_no_tracked_zips.sh',
      '      - run: bash scripts/ci/verify_zip_history_pr.sh',
    ].join('\n'));
    fs.writeFileSync(path.join(root, '.github/workflows/gitleaks.yml'), [
      'name: GATE — Secret Scan',
      'jobs:',
      '  gitleaks:',
    ].join('\n'));
    fs.writeFileSync(path.join(root, '.github/workflows/ops-pr-issue-accounting.yml'), [
      'name: GATE — PR Issue Accounting',
      'jobs:',
      '  pr-issue-accounting:',
    ].join('\n'));

    const result = validateMergeProtectionSurface({ root });
    expect(result.ok, result.errors.join('\n')).toBe(true);
  });

  it('reports a missing quality workflow without throwing', () => {
    const root = makeTempRoot();
    fs.writeFileSync(path.join(root, '.github/workflows/gitleaks.yml'), [
      'name: GATE — Secret Scan',
      'jobs:',
      '  gitleaks:',
    ].join('\n'));
    fs.writeFileSync(path.join(root, '.github/workflows/ops-pr-issue-accounting.yml'), [
      'name: GATE — PR Issue Accounting',
      'jobs:',
      '  pr-issue-accounting:',
    ].join('\n'));

    const result = validateMergeProtectionSurface({ root });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Missing merge-protection workflow: gate-quality.yml');
  });

  it('renders branch-protection checklist text', () => {
    const checklist = renderBranchProtectionChecklist();
    expect(checklist).toContain('quality');
    expect(checklist).toContain('gitleaks');
    expect(checklist).toContain('pr-issue-accounting');
    expect(checklist).toContain('check-no-zip-files');
  });
});
