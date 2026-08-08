import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Contract for #2858 Task 004 / #2905 — cross-route qualification + handoff evidence.
 * Constants duplicated (not imported from other *.test.ts) to avoid re-registering suites.
 */
const FANCLUB_RESPONSIVE_BREAKPOINTS = {
  mobile: 390,
  tablet: 768,
  desktopNarrow: 920,
  desktop: 1280,
  galleryGridMin: 900,
} as const;

const HAMBURGER_ONLY_MAX_WIDTH_PX = 767;

const FANCLUB_AUTHENTICATED_ROUTES = [
  '/fanclub',
  '/fanclub/myprofile',
  '/fanclub/membercard',
  '/fanclub/photo',
  '/fanclub/library',
  '/fanclub/memorabilia',
  '/fanclub/chat',
  '/fanclub/submit',
] as const;

const QUALIFICATION_REPORT = 'docs/ops/reports/fanclub-responsive-qualification-handoff-2905.md';

const OVERFLOW_E2E_FILES = [
  'tests/e2e/mobile-navigation.spec.ts',
  'tests/e2e/fanclub-galleries-mobile.spec.ts',
  'tests/e2e/fanclub-qualification-mobile.spec.ts',
] as const;

/** Routes that must appear in at least one overflow e2e suite (membercard is redirect-only). */
const QUALIFIED_OVERFLOW_ROUTES = [
  '/fanclub',
  '/fanclub/myprofile',
  '/fanclub/photo',
  '/fanclub/library',
  '/fanclub/memorabilia',
  '/fanclub/chat',
  '/fanclub/submit',
  '/search',
] as const;

function e2eHasGoto(source: string, route: string): boolean {
  return (
    source.includes(`goto('${route}'`) ||
    source.includes(`goto("${route}"`) ||
    source.includes(`goto(\`${route}\``) ||
    source.includes(`goto('${route}?`) ||
    source.includes(`goto(\`${route}?`)
  );
}

describe('fanclub responsive qualification (#2905 / #2858-004)', () => {
  it('ships the qualification and Production handoff report', () => {
    expect(existsSync(QUALIFICATION_REPORT)).toBe(true);
    const report = readFileSync(QUALIFICATION_REPORT, 'utf8');
    expect(report).toContain('#2905');
    expect(report).toContain('component/fanclub-responsive-completion');
    expect(report).toContain('Rollback proof');
    expect(report).toContain('Production handoff checklist');
    expect(report).toContain('#2857');
    expect(report).toContain('#2860');
  });

  it('records required breakpoints and hamburger contract', () => {
    const report = readFileSync(QUALIFICATION_REPORT, 'utf8');
    for (const width of Object.values(FANCLUB_RESPONSIVE_BREAKPOINTS)) {
      expect(report).toContain(String(width));
    }
    expect(report).toContain(String(HAMBURGER_ONLY_MAX_WIDTH_PX));
  });

  it('maps every authenticated Fan Club route in the qualification matrix', () => {
    const report = readFileSync(QUALIFICATION_REPORT, 'utf8');
    for (const route of FANCLUB_AUTHENTICATED_ROUTES) {
      expect(report).toContain(`| \`${route}\``);
    }
  });

  it('covers qualified routes with overflow e2e goto coverage', () => {
    const combined = OVERFLOW_E2E_FILES.map((path) => readFileSync(path, 'utf8')).join('\n');
    for (const route of QUALIFIED_OVERFLOW_ROUTES) {
      expect(e2eHasGoto(combined, route), `Missing overflow e2e goto for ${route}`).toBe(true);
    }
  });

  it('ships dedicated qualification playwright suite', () => {
    expect(existsSync('tests/e2e/fanclub-qualification-mobile.spec.ts')).toBe(true);
    const e2e = readFileSync('tests/e2e/fanclub-qualification-mobile.spec.ts', 'utf8');
    expect(e2e).toContain('assertNoHorizontalOverflow');
    expect(e2e).toContain('844');
    expect(e2e).toContain('390');
  });

  it('records ordered multi-step rollback of child PRs without auth rollback', () => {
    const report = readFileSync(QUALIFICATION_REPORT, 'utf8');
    expect(report).toContain('#3192');
    expect(report).toContain('#3191');
    expect(report).toContain('#3187');
    expect(report).toContain('useMemberSession');
    expect(report).toMatch(/Do \*\*not\*\* roll back unrelated authenticated backend/i);
  });
});
