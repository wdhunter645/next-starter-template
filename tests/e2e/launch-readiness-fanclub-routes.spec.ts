import { expect, test, type Page } from '@playwright/test';
import manifest from '../../scripts/launch-readiness/manifest.json';

async function mockMemberSession(page: Page) {
  await page.route('**/api/session/me', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, email: 'fan@example.com', role: 'member' }),
    });
  });
}

test.describe('launch readiness fan club routes', () => {
  test.beforeEach(async ({ page }) => {
    await mockMemberSession(page);
  });

  for (const route of manifest.fanclubPlaywrightRoutes) {
    test(`loads ${route} for an authenticated member`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await expect(page.locator('header').first()).toBeVisible();
      await expect(page.locator('footer').first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Club Home' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Logout' }).first()).toBeVisible();
    });
  }
});
