import { expect, test, type Page } from '@playwright/test';

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

async function mockGalleryApis(page: Page) {
  await page.route('**/api/fanclub/photos/tags**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, tags: ['yankees', 'museum'] }),
    });
  });
  await page.route('**/api/fanclub/memorabilia/tags**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, tags: ['bat', 'card'] }),
    });
  });
  // List endpoint (distinct from /photos); memorabilia page uses buildFanclubPhotoListApiUrl({ memorabilia: true }).
  await page.route('**/api/fanclub/memorabilia**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        items: [
          {
            id: 1,
            title: 'Long memorabilia title that should wrap without forcing horizontal overflow on mobile',
            description: 'Description text that wraps safely.',
            tags: 'bat',
            thumbnail_url: '/IMG_1946.png',
          },
        ],
        related_library_entries: [],
      }),
    });
  });
  await page.route('**/api/fanclub/photos**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        items: [
          {
            id: 1,
            title: 'Long gallery title that should wrap without forcing horizontal overflow on mobile',
            description: 'Description text that wraps safely.',
            tags: 'yankees',
            thumbnail_url: '/IMG_1946.png',
          },
        ],
        related_library_entries: [],
      }),
    });
  });
  await page.route('**/api/fanclub/library**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        items: [
          {
            id: 1,
            title: 'Long library story title that should wrap on narrow viewports without overflow',
            content: 'Body copy that wraps safely on mobile widths.',
            author: 'Archive',
            year: 1939,
            created_at: '2026-08-08T00:00:00.000Z',
          },
        ],
      }),
    });
  });
  await page.route('**/api/search**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        query: 'gehrig',
        page: 1,
        pages: 1,
        total: 1,
        isMember: true,
        results: [
          {
            type: 'story',
            title: 'Long search result title that should wrap without horizontal overflow',
            excerpt: 'Excerpt that wraps safely on mobile.',
            url: '/fanclub/library',
          },
        ],
      }),
    });
  });
}

test.describe('fanclub gallery mobile overflow (#2904)', () => {
  test('keeps /fanclub/photo free of horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await mockMemberSession(page);
    await mockGalleryApis(page);
    await page.goto('/fanclub/photo');
    await expect(page.locator('main').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('keeps /fanclub/library free of horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await mockMemberSession(page);
    await mockGalleryApis(page);
    await page.goto('/fanclub/library');
    await expect(page.locator('main').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('keeps /fanclub/memorabilia free of horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await mockMemberSession(page);
    await mockGalleryApis(page);
    await page.goto('/fanclub/memorabilia');
    await expect(page.locator('main').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });

  test('keeps /search free of horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await mockGalleryApis(page);
    await page.goto('/search?q=gehrig');
    await expect(page.locator('main').first()).toBeVisible();
    await assertNoHorizontalOverflow(page);
  });
});
