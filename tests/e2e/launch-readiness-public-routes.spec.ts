import { expect, test, type Page } from '@playwright/test';
import manifest from '../../scripts/launch-readiness/manifest.json';

async function assertPublicShell(page: Page) {
  await expect(page.locator('header').first()).toBeVisible();
  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await expect(page.locator('header').getByRole('link', { name: 'Admin' })).toHaveCount(0);
}

test.describe('launch readiness public routes', () => {
  for (const route of manifest.publicPlaywrightRoutes) {
    test(`loads ${route} with header and footer`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.ok()).toBeTruthy();
      await assertPublicShell(page);
    });
  }

  test('does not expose a /store route in static navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Store' }).first()).toHaveAttribute(
      'href',
      /bonfire\.com\/store\/lou-gehrig-fan-club/,
    );
  });
});
