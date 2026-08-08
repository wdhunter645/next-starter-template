import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Contract for #2858 Task 003 / #2904 — gallery/list/search responsiveness.
 * Does not authorize PhotoLightboxGrid or #2857 photo intake/detail.
 */
describe('fanclub responsive galleries (#2904 / #2858-003)', () => {
  it('ships fluid CSS modules for photo, library, memorabilia, and search', () => {
    for (const path of [
      'src/app/fanclub/photo/page.module.css',
      'src/app/fanclub/library/page.module.css',
      'src/app/fanclub/memorabilia/page.module.css',
      'src/app/search/page.module.css',
    ]) {
      expect(existsSync(path), path).toBe(true);
      const css = readFileSync(path, 'utf8');
      expect(css).toContain('min-height: 44px');
      expect(css).toMatch(/max-width:\s*100%|width:\s*100%/);
    }
  });

  it('uses 1→2→3 column gallery breakpoints', () => {
    const css = readFileSync('src/components/fanclub/fanclubGridStyles.module.css', 'utf8');
    expect(css).toContain('grid-template-columns: 1fr');
    expect(css).toContain('@media (min-width: 600px)');
    expect(css).toContain('repeat(2, minmax(0, 1fr))');
    expect(css).toContain('@media (min-width: 900px)');
    expect(css).toContain('repeat(3, minmax(0, 1fr))');
  });

  it('keeps PhotoLightboxGrid out of list gallery pages', () => {
    for (const path of [
      'src/app/fanclub/photo/page.tsx',
      'src/app/fanclub/library/page.tsx',
      'src/app/fanclub/memorabilia/page.tsx',
    ]) {
      const source = readFileSync(path, 'utf8');
      expect(source).not.toContain('PhotoLightboxGrid');
    }
  });

  it('covers gallery and search routes in dedicated mobile playwright suite', () => {
    const e2e = readFileSync('tests/e2e/fanclub-galleries-mobile.spec.ts', 'utf8');
    for (const route of ['/fanclub/photo', '/fanclub/library', '/fanclub/memorabilia']) {
      const pattern = new RegExp(`goto\\(\\s*['"\`]${route}['"\`]`);
      expect(e2e).toMatch(pattern);
    }
    expect(e2e).toMatch(/goto\(\s*['"`]\/search(?:\?[^'"`]*)?['"`]/);
    expect(e2e).toContain('assertNoHorizontalOverflow');
  });
});
