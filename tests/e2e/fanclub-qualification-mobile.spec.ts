import { expect, test, type Page } from '@playwright/test';

/**
 * #2905 cross-route qualification — overflow + landscape smoke.
 * Complements shell (`mobile-navigation`) and gallery (`fanclub-galleries-mobile`) suites.
 */

const QUALIFIED_ROUTES = [
  '/fanclub',
  '/fanclub/myprofile',
  '/fanclub/photo',
  '/fanclub/library',
  '/fanclub/memorabilia',
  '/fanclub/chat',
  '/fanclub/submit',
] as const;

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function mockMemberSession(page: Page) {
  await page.route('**/api/session/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, email: 'fan@example.com', role: 'member' }),
    });
  });
}

async function mockQualificationApis(page: Page) {
  await page.route('**/api/fanclub/profile', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        profile: {
          email: 'fan@example.com',
          first_name: 'Fan',
          last_name: 'Member',
          screen_name: 'fan',
          email_opt_in: true,
        },
      }),
    });
  });
  await page.route('**/api/content/membercard', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, content: null }),
    });
  });
  await page.route('**/api/discussions/list**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, items: [] }),
    });
  });
  await page.route('**/api/fanclub/photos/tags**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, tags: [] }),
    });
  });
  await page.route('**/api/fanclub/memorabilia/tags**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, tags: [] }),
    });
  });
  await page.route('**/api/fanclub/memorabilia**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, items: [], related_library_entries: [] }),
    });
  });
  await page.route('**/api/fanclub/photos**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, items: [], related_library_entries: [] }),
    });
  });
  await page.route('**/api/fanclub/library**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, items: [] }),
    });
  });
}

test.describe('fanclub cross-route qualification (#2905)', () => {
  for (const route of QUALIFIED_ROUTES) {
    test(`keeps ${route} free of horizontal overflow on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await mockMemberSession(page);
      await mockQualificationApis(page);
      await page.goto(route);
      await expect(page.locator('main').first()).toBeVisible();
      await assertNoHorizontalOverflow(page);
    });
  }

  test('keeps /fanclub free of horizontal overflow in landscape mobile', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await mockMemberSession(page);
    await mockQualificationApis(page);
    await page.goto('/fanclub');
    await expect(page.locator('main').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});
