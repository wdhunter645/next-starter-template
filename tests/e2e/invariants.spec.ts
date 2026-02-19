import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/search",
  "/join",
  "/login",
  "/faq",
];

test("Public routes load (no 404 and not blank)", async ({ page }) => {
  for (const path of PUBLIC_ROUTES) {
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res, `No response for ${path}`).toBeTruthy();
    expect(res?.status(), `Bad status for ${path}`).toBeLessThan(400);

    // Basic sanity: page has an <h1> or at least non-empty body text.
    const bodyText = await page.locator("body").innerText();
    expect(bodyText.trim().length, `Blank page for ${path}`).toBeGreaterThan(40);
  }
});
