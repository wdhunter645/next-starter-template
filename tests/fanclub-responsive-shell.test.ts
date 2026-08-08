import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { HAMBURGER_MENU_ITEMS } from '@/components/HamburgerMenu';

/**
 * Contract for #2858 Task 002 / #2903 — shared shell, nav IA, profile/auth forms.
 * Does not authorize photo/library/memorabilia gallery implementation (#2904 / #2857).
 */
describe('fanclub responsive shell (#2903 / #2858-002)', () => {
  it('exposes full authenticated Fan Club drawer IA', () => {
    const labels = HAMBURGER_MENU_ITEMS.fanclub.map((item) => item.label);
    expect(labels).toEqual([
      'Club Home',
      'My Profile',
      'Photo',
      'Library',
      'Memorabilia',
      'Chat',
      'Submit',
      'Search',
      'Store',
      'Logout',
      'About',
      'Contact',
    ]);
  });

  it('ships fluid profile and membership-card layout modules', () => {
    expect(existsSync('src/app/fanclub/myprofile/page.module.css')).toBe(true);
    expect(existsSync('src/components/fanclub/MembershipCardSection.module.css')).toBe(true);
    const profileCss = readFileSync('src/app/fanclub/myprofile/page.module.css', 'utf8');
    const cardCss = readFileSync('src/components/fanclub/MembershipCardSection.module.css', 'utf8');
    expect(profileCss).toContain('min-height: 44px');
    expect(profileCss).toContain('max-width: 100%');
    expect(cardCss).toContain('max-width: min(190px, 100%)');
  });

  it('ships fluid submit and chat form layout modules', () => {
    expect(existsSync('src/app/fanclub/submit/page.module.css')).toBe(true);
    expect(existsSync('src/app/fanclub/chat/page.module.css')).toBe(true);
    const submitCss = readFileSync('src/app/fanclub/submit/page.module.css', 'utf8');
    const chatCss = readFileSync('src/app/fanclub/chat/page.module.css', 'utf8');
    expect(submitCss).toContain('min-height: 44px');
    expect(chatCss).toContain('flex-wrap: wrap');
    expect(chatCss).toContain('overflow-wrap: anywhere');
  });

  it('keeps fanclub session fail-closed layout untouched', () => {
    const layout = readFileSync('src/app/fanclub/layout.tsx', 'utf8');
    expect(layout).toContain('useMemberSession');
    expect(layout).toContain("redirectTo: '/'");
  });

  it('covers shell form routes in mobile playwright overflow suite', () => {
    const e2e = readFileSync('tests/e2e/mobile-navigation.spec.ts', 'utf8');
    for (const route of ['/fanclub/myprofile', '/fanclub/submit', '/fanclub/chat']) {
      expect(e2e).toContain(`'${route}'`);
    }
  });
});
