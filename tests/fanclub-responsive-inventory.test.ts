import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Contract for #2858 Task 001 / #2902 — Fan Club responsive inventory.
 * Breakpoints stay aligned with the public/fanclub header contract from #1259 Task 004.
 */
export const FANCLUB_RESPONSIVE_BREAKPOINTS = {
  mobile: 390,
  tablet: 768,
  desktopNarrow: 920,
  desktop: 1280,
  galleryGridMin: 900,
} as const;

export const HAMBURGER_ONLY_MAX_WIDTH_PX = 767;

/** Authenticated Fan Club routes under src/app/fanclub (session layout). */
export const FANCLUB_AUTHENTICATED_ROUTES = [
  '/fanclub',
  '/fanclub/myprofile',
  '/fanclub/membercard',
  '/fanclub/photo',
  '/fanclub/library',
  '/fanclub/memorabilia',
  '/fanclub/chat',
  '/fanclub/submit',
] as const;

const ROUTE_PAGE_FILES: Record<(typeof FANCLUB_AUTHENTICATED_ROUTES)[number], string> = {
  '/fanclub': 'src/app/fanclub/page.tsx',
  '/fanclub/myprofile': 'src/app/fanclub/myprofile/page.tsx',
  '/fanclub/membercard': 'src/app/fanclub/membercard/page.tsx',
  '/fanclub/photo': 'src/app/fanclub/photo/page.tsx',
  '/fanclub/library': 'src/app/fanclub/library/page.tsx',
  '/fanclub/memorabilia': 'src/app/fanclub/memorabilia/page.tsx',
  '/fanclub/chat': 'src/app/fanclub/chat/page.tsx',
  '/fanclub/submit': 'src/app/fanclub/submit/page.tsx',
};

const INVENTORY_REPORT = 'docs/ops/reports/fanclub-responsive-route-component-inventory-2902.md';

describe('fanclub responsive inventory (#2902 / #2858-001)', () => {
  it('ships the inventory report', () => {
    expect(existsSync(INVENTORY_REPORT)).toBe(true);
    const report = readFileSync(INVENTORY_REPORT, 'utf8');
    expect(report).toContain('#2902');
    expect(report).toContain('component/fanclub-responsive-completion');
    expect(report).toContain('#2857');
  });

  it('maps every authenticated Fan Club route to a page file', () => {
    for (const route of FANCLUB_AUTHENTICATED_ROUTES) {
      const pageFile = ROUTE_PAGE_FILES[route];
      expect(existsSync(pageFile), `Missing page for ${route}: ${pageFile}`).toBe(true);
    }
  });

  it('keeps Fan Club layout session-gated', () => {
    const layout = readFileSync('src/app/fanclub/layout.tsx', 'utf8');
    expect(layout).toContain('useMemberSession');
    expect(layout).toContain("redirectTo: '/'");
  });

  it('documents header hamburger breakpoint for Fan Club shell', () => {
    const css = readFileSync('src/components/FanClubHeader.module.css', 'utf8');
    expect(css).toContain(`@media (max-width: ${HAMBURGER_ONLY_MAX_WIDTH_PX}px)`);
    expect(css).toContain('.center .btn');
  });

  it('documents gallery grid breakpoint used by photo/memorabilia', () => {
    const css = readFileSync('src/components/fanclub/fanclubGridStyles.module.css', 'utf8');
    expect(css).toContain(`@media (min-width: ${FANCLUB_RESPONSIVE_BREAKPOINTS.galleryGridMin}px)`);
    expect(css).toContain('repeat(3, minmax(0, 1fr))');
  });

  it('records deep-route overflow coverage gap versus Club Home baseline', () => {
    const e2e = readFileSync('tests/e2e/mobile-navigation.spec.ts', 'utf8');
    expect(e2e).toContain("'/fanclub'");
    // Deep routes are successor work (#2904/#2905); inventory asserts the gap remains explicit.
    for (const deep of ['/fanclub/photo', '/fanclub/library', '/fanclub/memorabilia', '/fanclub/chat']) {
      expect(e2e.includes(`goto('${deep}'`) || e2e.includes(`goto("${deep}"`)).toBe(false);
    }
  });

  it('lists inventory breakpoints in the report matrix', () => {
    const report = readFileSync(INVENTORY_REPORT, 'utf8');
    for (const width of Object.values(FANCLUB_RESPONSIVE_BREAKPOINTS)) {
      expect(report).toContain(String(width));
    }
  });
});
