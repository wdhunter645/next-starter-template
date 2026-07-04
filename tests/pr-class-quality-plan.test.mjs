import { describe, expect, it } from 'vitest';
import { determineQualityPlan, normalizePrClass, renderQualityPlan } from '../scripts/ci/pr_class_quality_plan.mjs';

function bodyFor(prClass) {
  return `# PR Summary\n\n- **Issue:** #2181\n- Intent label: intent:ci\n- PR class: ${prClass}\n`;
}

describe('PR class quality plan', () => {
  it('normalizes valid PR classes', () => {
    expect(normalizePrClass('ci')).toBe('ci');
    expect(normalizePrClass('mixed-approved')).toBe('mixed-approved');
  });

  it('rejects invalid or placeholder PR classes', () => {
    expect(normalizePrClass('')).toBe('');
    expect(normalizePrClass('<!-- code / ci -->')).toBe('');
    expect(normalizePrClass('unknown')).toBe('');
  });

  it('runs full quality for code, release, and mixed-approved PRs', () => {
    for (const prClass of ['code', 'release', 'mixed-approved']) {
      const plan = determineQualityPlan({ body: bodyFor(prClass) });
      expect(plan.prClass).toBe(prClass);
      expect(plan.typecheck).toBe(true);
      expect(plan.lint).toBe(true);
      expect(plan.test).toBe(true);
      expect(plan.build).toBe(true);
    }
  });

  it('skips production build for governance, CI, config, ops, and docs classes', () => {
    for (const prClass of ['docs-governance', 'docs-content', 'ci', 'config', 'ops']) {
      const plan = determineQualityPlan({ body: bodyFor(prClass) });
      expect(plan.prClass).toBe(prClass);
      expect(plan.typecheck).toBe(true);
      expect(plan.lint).toBe(true);
      expect(plan.build).toBe(false);
    }
  });

  it('skips unit tests for docs-only and ops classes', () => {
    for (const prClass of ['docs-governance', 'docs-content', 'ops', 'config']) {
      const plan = determineQualityPlan({ body: bodyFor(prClass) });
      expect(plan.test).toBe(false);
    }
  });

  it('defaults to full code profile when class is missing', () => {
    const plan = determineQualityPlan({ body: '# PR Summary\n\n- **Issue:** #2181' });
    expect(plan.prClass).toBe('code');
    expect(plan.explicitPrClass).toBe(false);
    expect(plan.build).toBe(true);
  });

  it('renders the selected plan', () => {
    const rendered = renderQualityPlan(determineQualityPlan({ body: bodyFor('ci') }));
    expect(rendered).toContain('PR class: ci');
    expect(rendered).toContain('Run production build: no');
  });
});
