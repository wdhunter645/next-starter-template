import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import manifest from '../scripts/launch-readiness/manifest.json';

/** H-011 disposition recorded in Task 007 ops report (#1259). */
export const H011_DISPOSITION = 'bounded-deferral-with-operator-sign-off' as const;

/** Legacy T50 issue disposition after Task 007 (#1112). */
export const T50_DISPOSITION = 'partially-satisfied-bounded-deferral' as const;

/** Workflows that provide complementary scheduled validation (not launch-readiness e2e). */
export const COMPLEMENTARY_CI_WORKFLOWS = [
  'assess-nightly.yml',
  'ops-assess.yml',
  'production-audit.yml',
  'gate-quality.yml',
] as const;

/** Manual / local launch-readiness entry points (PR #1221). */
export const LAUNCH_READINESS_SCRIPTS = [
  'launch-readiness',
  'launch-readiness:unit',
  'launch-readiness:e2e',
] as const;

function readSource(path: string): string {
  expect(existsSync(path), `Missing file: ${path}`).toBe(true);
  return readFileSync(path, 'utf8');
}

function listWorkflowFiles(): string[] {
  const dir = join('.github', 'workflows');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
    .sort();
}

describe('launch readiness H-011 disposition (#1259 Task 007)', () => {
  it('records bounded deferral disposition constants for downstream reports', () => {
    expect(H011_DISPOSITION).toBe('bounded-deferral-with-operator-sign-off');
    expect(T50_DISPOSITION).toBe('partially-satisfied-bounded-deferral');
  });

  it('ships T50 launch-readiness manifest and orchestrator on disk', () => {
    readSource('scripts/launch-readiness/manifest.json');
    readSource('scripts/launch-readiness/run.mjs');
    readSource('scripts/launch-readiness/README.md');
    expect(manifest.requiredRoutes.length).toBeGreaterThan(10);
    expect(manifest.publicPlaywrightRoutes.length).toBeGreaterThan(0);
    expect(manifest.fanclubPlaywrightRoutes.length).toBeGreaterThan(0);
  });

  it('wires launch-readiness npm scripts for manual pre-release runs', () => {
    const pkg = JSON.parse(readSource('package.json')) as { scripts?: Record<string, string> };
    for (const script of LAUNCH_READINESS_SCRIPTS) {
      expect(pkg.scripts?.[script], `Missing npm script: ${script}`).toBeTruthy();
    }
    expect(pkg.scripts?.['launch-readiness:unit']).toContain('launch-readiness-manifest.test.ts');
    expect(pkg.scripts?.['launch-readiness:e2e']).toContain('launch-readiness-public-routes.spec.ts');
  });

  it('includes launch-readiness manifest tests in default npm test surface', () => {
    const pkg = JSON.parse(readSource('package.json')) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.test).toContain('vitest');
    expect(existsSync('tests/launch-readiness-manifest.test.ts')).toBe(true);
  });

  it('documents H-011 gap: no workflow references launch-readiness scripts', () => {
    const workflows = listWorkflowFiles();
    const hits: string[] = [];

    for (const file of workflows) {
      const source = readSource(join('.github', 'workflows', file));
      if (/launch-readiness|launch_readiness/i.test(source)) {
        hits.push(file);
      }
    }

    expect(hits, `Unexpected launch-readiness CI wiring: ${hits.join(', ')}`).toEqual([]);
  });

  it('maps complementary scheduled CI workflows that do not replace launch-readiness e2e', () => {
    for (const file of COMPLEMENTARY_CI_WORKFLOWS) {
      readSource(join('.github', 'workflows', file));
    }

    const quality = readSource('.github/workflows/gate-quality.yml');
    expect(quality).toContain('npm test');
    expect(quality).not.toMatch(/launch-readiness/i);

    const nightly = readSource('.github/workflows/assess-nightly.yml');
    expect(nightly).toContain('assess:ci');
    expect(nightly).not.toMatch(/launch-readiness/i);

    const prodAudit = readSource('.github/workflows/production-audit.yml');
    expect(prodAudit).toContain('playwright');
    expect(prodAudit).not.toMatch(/launch-readiness/i);
  });

  it('ships Playwright launch-readiness specs for static-export smoke', () => {
    const specs = [
      'tests/e2e/launch-readiness-public-routes.spec.ts',
      'tests/e2e/launch-readiness-fanclub-routes.spec.ts',
    ];
    for (const spec of specs) {
      const source = readSource(spec);
      expect(source).toContain('manifest.json');
    }
  });

  it('defines the documented future scheduled e2e path command chain', () => {
    const orchestrator = readSource('scripts/launch-readiness/run.mjs');
    expect(orchestrator).toContain('npm run assess');
    expect(orchestrator).toContain('launch-readiness-public-routes.spec.ts');
    expect(orchestrator).toContain('LAUNCH_READINESS_E2E=1');
  });
});
