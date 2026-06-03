import { describe, expect, it } from 'vitest';
import {
  MERGE_PROTECTION_SURFACE,
  RETIRED_MERGE_PROTECTION_WORKFLOWS,
  renderBranchProtectionChecklist,
  validateMergeProtectionSurface,
} from '../scripts/ci/merge_protection_surface.mjs';

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

  it('renders branch-protection checklist text', () => {
    const checklist = renderBranchProtectionChecklist();
    expect(checklist).toContain('quality');
    expect(checklist).toContain('gitleaks');
    expect(checklist).toContain('pr-issue-accounting');
    expect(checklist).toContain('check-no-zip-files');
  });
});
