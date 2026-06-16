import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** Breakpoints exercised in `tests/e2e/mobile-navigation.spec.ts`. */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 390,
  tablet: 768,
  desktopNarrow: 920,
  desktop: 1280,
} as const;

/** CSS breakpoint where public/fanclub headers switch to hamburger-only nav. */
export const HAMBURGER_ONLY_MAX_WIDTH_PX = 767;

const MOBILE_TEST_FILES = [
  'tests/mobile-navigation.test.tsx',
  'tests/e2e/mobile-navigation.spec.ts',
] as const;

const MOBILE_E2E_PRIORITY_ROUTES = ['/', '/fanclub'] as const;

describe('mobile responsive contract (#1259 Task 004)', () => {
  it('ships mobile navigation unit and playwright suites', () => {
    const missing = MOBILE_TEST_FILES.filter((path) => !existsSync(path));
    expect(missing, `Missing mobile test files: ${missing.join(', ')}`).toEqual([]);
  });

  it('aligns documented breakpoints with mobile playwright coverage', () => {
    const e2e = readFileSync('tests/e2e/mobile-navigation.spec.ts', 'utf8');
    for (const width of Object.values(RESPONSIVE_BREAKPOINTS)) {
      expect(e2e).toContain(String(width));
    }
  });

  it('covers priority public and fanclub routes in mobile playwright', () => {
    const e2e = readFileSync('tests/e2e/mobile-navigation.spec.ts', 'utf8');
    for (const route of MOBILE_E2E_PRIORITY_ROUTES) {
      expect(e2e).toContain(`goto('${route}'`);
    }
  });

  it('hides public header center buttons at the mobile breakpoint', () => {
    const css = readFileSync('src/components/Header.module.css', 'utf8');
    expect(css).toContain(`@media (max-width: ${HAMBURGER_ONLY_MAX_WIDTH_PX}px)`);
    expect(css).toMatch(/@media \(max-width: 767px\)\s*\{[\s\S]*\.center \.btn\s*\{[\s\S]*display:\s*none/s);
  });

  it('hides fanclub header center buttons at the mobile breakpoint', () => {
    const css = readFileSync('src/components/FanClubHeader.module.css', 'utf8');
    expect(css).toContain(`@media (max-width: ${HAMBURGER_ONLY_MAX_WIDTH_PX}px)`);
    expect(css).toMatch(/@media \(max-width: 767px\)\s*\{[\s\S]*\.center \.btn\s*\{[\s\S\S]*display:\s*none/s);
  });

  it('documents overflow guard helper in mobile playwright', () => {
    const e2e = readFileSync('tests/e2e/mobile-navigation.spec.ts', 'utf8');
    expect(e2e).toContain('assertNoHorizontalOverflow');
    expect(e2e).toContain('scrollWidth');
  });

  it('documents footer responsive invariants in mobile playwright', () => {
    const e2e = readFileSync('tests/e2e/mobile-navigation.spec.ts', 'utf8');
    expect(e2e).toContain('footer responsive invariants');
    expect(e2e).toContain("name: 'Privacy'");
    expect(e2e).toContain("name: 'Contact'");
  });
});
