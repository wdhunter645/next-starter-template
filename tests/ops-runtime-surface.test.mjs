import { describe, expect, it } from 'vitest';
import {
  OPS_RUNTIME_SURFACE,
  renderOpsRuntimeChecklist,
  validateOpsRuntimeSurface,
} from '../scripts/ci/ops_runtime_surface.mjs';

describe('OPS runtime surface inventory', () => {
  it('validates the repository OPS runtime workflow surface', () => {
    const result = validateOpsRuntimeSurface();
    expect(result.ok, result.errors.join('\n')).toBe(true);
  });

  it('documents consolidated OPS runtime workflows', () => {
    expect(OPS_RUNTIME_SURFACE.map((entry) => entry.file)).toEqual([
      'ops-assess.yml',
      'ops-cf-pages-retry.yml',
      'production-audit.yml',
      'ops-main-change-monitor.yml',
      'snapshot.yml',
      'b2-s3-smoke-test.yml',
      'b2-d1-daily-sync.yml',
    ]);
  });

  it('renders runtime checklist text', () => {
    const checklist = renderOpsRuntimeChecklist();
    expect(checklist).toContain('OPS — Site Assessment');
    expect(checklist).toContain('ops_runtime_escalation.mjs');
  });
});
