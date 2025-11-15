import { test, expect } from '@playwright/test';

/**
 * Regression tests for homepage section existence and visibility
 * 
 * These tests ensure that all major homepage sections are:
 * 1. Structurally present in the DOM
 * 2. Actually visible to users (not hidden or empty)
 * 3. Contain non-empty content elements
 * 
 * Critical for preventing regressions like the Social Wall empty box issue.
 */

test.describe('Homepage Section Visibility and Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display Weekly Matchup section with visible content', async ({ page }) => {
    // Find the section by its heading
    const weeklySection = page.locator('section#weekly');
    await expect(weeklySection).toBeVisible();

    // Verify the section title is present
    const weeklyTitle = page.getByText('Weekly Photo Matchup. Vote for your favorite!');
    await expect(weeklyTitle).toBeVisible();

    // Verify the section has visible content (not just an empty container)
    const weeklyContent = weeklySection.locator('div, p, a, img').first();
    await expect(weeklyContent).toBeVisible();
  });

  test('should display Social Wall section with Elfsight widget container', async ({ page }) => {
    // Find the Social Wall section
    const socialSection = page.locator('section#social-wall');
    await expect(socialSection).toBeVisible();

    // Verify the section heading is present
    const socialHeading = page.getByRole('heading', { name: /social wall/i });
    await expect(socialHeading).toBeVisible();

    // Verify subtitle/description is visible
    const socialDescription = page.getByText(/Live fan posts from/i);
    await expect(socialDescription).toBeVisible();

    // Verify the Elfsight widget container exists in the DOM (even if not visually rendered yet)
    const elfsightContainer = page.locator('.elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8');
    await expect(elfsightContainer).toBeAttached();

    // Verify fallback text is present (for when script loads slowly or fails)
    const fallbackText = page.getByText(/Loading social wall content/i);
    await expect(fallbackText).toBeVisible();

    // Verify the section has at least one visible element
    const socialContent = socialSection.locator('div, p, h2').first();
    await expect(socialContent).toBeVisible();
  });

  test('should display Friends of the Fan Club section with visible content', async ({ page }) => {
    // Find the section
    const friendsSection = page.locator('section#friends-of-the-club');
    await expect(friendsSection).toBeVisible();

    // Verify the heading is present
    const friendsHeading = page.getByRole('heading', { name: /friends of the fan club/i });
    await expect(friendsHeading).toBeVisible();

    // Verify the section has visible content
    const friendsContent = friendsSection.locator('div, p, img').first();
    await expect(friendsContent).toBeVisible();
  });

  test('should display Events (Calendar) section with visible content', async ({ page }) => {
    // Find the calendar section
    const calendarSection = page.locator('section#calendar');
    await expect(calendarSection).toBeVisible();

    // Verify the heading is present (actual heading is "Calendar")
    const calendarHeading = page.getByRole('heading', { name: /calendar/i });
    await expect(calendarHeading).toBeVisible();

    // Verify the section has visible content
    const calendarContent = calendarSection.locator('div, p').first();
    await expect(calendarContent).toBeVisible();
  });

  test('should display FAQ section with visible content', async ({ page }) => {
    // Find the FAQ section (it's inside a two-column layout with milestones)
    const faqSection = page.locator('section#faq-milestones');
    await expect(faqSection).toBeVisible();

    // Verify FAQ heading is present (actual heading is "FAQ and Ask a Question")
    const faqHeading = page.getByRole('heading', { name: /FAQ and Ask a Question/i });
    await expect(faqHeading).toBeVisible();

    // Verify FAQ section has visible content
    const faqContent = faqSection.locator('div').first();
    await expect(faqContent).toBeVisible();
  });

  test('should display Milestones section with visible content', async ({ page }) => {
    // Find the milestones section (it's inside a two-column layout with FAQ)
    const milestonesSection = page.locator('section#faq-milestones');
    await expect(milestonesSection).toBeVisible();

    // Verify Milestones heading is present
    const milestonesHeading = page.getByRole('heading', { name: /milestones/i });
    await expect(milestonesHeading).toBeVisible();

    // Verify milestones section has visible content
    const milestonesContent = milestonesSection.locator('div').first();
    await expect(milestonesContent).toBeVisible();
  });

  test('should verify all sections are present in correct order', async ({ page }) => {
    // Get all main sections in order
    const sections = await page.locator('section[id]').all();
    
    // Verify we have at least 6 major sections
    expect(sections.length).toBeGreaterThanOrEqual(6);

    // Verify key sections exist by checking their IDs
    const sectionIds = await Promise.all(
      sections.map(async (section) => await section.getAttribute('id'))
    );

    expect(sectionIds).toContain('weekly');
    expect(sectionIds).toContain('join-cta');
    expect(sectionIds).toContain('social-wall');
    expect(sectionIds).toContain('friends-of-the-club');
    expect(sectionIds).toContain('calendar');
    expect(sectionIds).toContain('faq-milestones');
  });

  test('Social Wall should not be an empty box - regression guard', async ({ page }) => {
    // This test specifically guards against the Social Wall empty box regression
    const socialSection = page.locator('section#social-wall');
    await expect(socialSection).toBeVisible();

    // Check that the section has meaningful content
    const elfsightWidget = page.locator('.elfsight-app-805f3c5c-67cd-4edf-bde6-2d5978e386a8');
    const hasElfsightWidget = await elfsightWidget.count() > 0;
    const hasFallbackText = await page.getByText(/Loading social wall content/i).isVisible();
    const hasHeading = await page.getByRole('heading', { name: /social wall/i }).isVisible();

    // At minimum, we should have the heading AND (widget container OR fallback text)
    expect(hasHeading).toBeTruthy();
    expect(hasElfsightWidget || hasFallbackText).toBeTruthy();

    // Verify the section has a reasonable height (not collapsed to 0 or tiny)
    const sectionBox = await socialSection.boundingBox();
    expect(sectionBox).not.toBeNull();
    if (sectionBox) {
      expect(sectionBox.height).toBeGreaterThan(50); // At least 50px tall
    }
  });
});
