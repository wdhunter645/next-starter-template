import { test, expect } from '@playwright/test';

// V6 Design tokens for verification
const LGFC_BLUE_RGB = 'rgb(0, 51, 204)';
const WEEKLY_TITLE_TEXT = 'Weekly Photo Matchup. Vote for your favorite!';
const JOIN_BANNER_TEXT = 'Become a member. Get access to the Gehrig library, media archive, memorabilia archive, group discussions, and more.';

test.describe('Homepage V6 Token Compliance', () => {
  test('should display exact Weekly title text with correct styling', async ({ page }) => {
    await page.goto('/');
    
    // Assert exact Weekly title text is present
    const weeklyTitle = page.getByText(WEEKLY_TITLE_TEXT);
    await expect(weeklyTitle).toBeVisible();
    
    // Assert the title has the correct class
    const titleElement = page.locator('h2.title-lgfc');
    await expect(titleElement).toBeVisible();
    
    // Assert computed color equals rgb(0, 51, 204)
    const titleColor = await titleElement.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(titleColor).toBe(LGFC_BLUE_RGB);
  });

  test('should display exact Join banner copy with correct styling', async ({ page }) => {
    await page.goto('/');
    
    // Assert exact Join banner copy is present
    const joinText = page.getByText(JOIN_BANNER_TEXT);
    await expect(joinText).toBeVisible();
    
    // Assert .joinBanner background-color equals rgb(0, 51, 204)
    const joinBanner = page.locator('.joinBanner');
    await expect(joinBanner).toBeVisible();
    
    const bannerBgColor = await joinBanner.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(bannerBgColor).toBe(LGFC_BLUE_RGB);
  });

  test('should have topWhitespace spacer below header', async ({ page }) => {
    await page.goto('/');
    
    // Assert topWhitespace element exists
    const spacer = page.locator('.topWhitespace');
    await expect(spacer).toBeVisible();
    
    // Assert it has the correct height
    const spacerHeight = await spacer.evaluate((el) => {
      return window.getComputedStyle(el).height;
    });
    expect(spacerHeight).toBe('72px');
  });
});
