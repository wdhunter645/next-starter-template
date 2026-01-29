import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/", "/about", "/contact", "/support", "/terms", "/privacy", "/search", "/join", "/login", "/faq"
];

test("Public routes load (no 404 and not blank)", async ({ page }) => {
  for (const path of PUBLIC_ROUTES) {
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res, `No response for ${path}`).not.toBeNull();
    expect(res!.status(), `Bad HTTP status for ${path}`).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toHaveText(/^\s*$/);
  }
});

test("/health responds OK", async ({ request }) => {
  const res = await request.get("/health");
  expect(res.status()).toBeLessThan(400);
});

test("Auth-gated routes redirect to / when logged out", async ({ page }) => {
  const fanclub = await page.goto("/fanclub", { waitUntil: "domcontentloaded" });
  expect(fanclub, "No response for /fanclub").not.toBeNull();
  await page.waitForTimeout(500);
  expect(
    page.url().endsWith("/") || page.url().includes("/?"),
    `Expected redirect to /, got ${page.url()}`
  ).toBeTruthy();

  const admin = await page.goto("/admin", { waitUntil: "domcontentloaded" }).catch(() => null);
  if (admin) {
    expect(admin.status(), "Admin route returned 500+").toBeLessThan(500);
    await page.waitForTimeout(500);
    const ok = page.url().endsWith("/") || page.url().includes("/?") || admin.status() === 404;
    expect(ok, `Expected redirect to / or 404 for /admin, got ${admin.status()} at ${page.url()}`).toBeTruthy();
  }
});

test("Logged-out header/footer contain required navigation targets (sanity)", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const header = page.locator("header");
  await expect(header).toBeVisible();

  await expect(page.locator('a[href="/join"], a[href$="/join"]')).toHaveCountGreaterThan(0);
  await expect(page.locator('a[href="/login"], a[href$="/login"]')).toHaveCountGreaterThan(0);
  await expect(page.locator('a[href="/search"], a[href$="/search"]')).toHaveCountGreaterThan(0);

  const footer = page.locator("footer");
  await expect(footer).toBeVisible();

  await expect(page.locator('footer a[href="/contact"], footer a[href$="/contact"]')).toHaveCountGreaterThan(0);
  await expect(page.locator('footer a[href="/support"], footer a[href$="/support"]')).toHaveCountGreaterThan(0);
  await expect(page.locator('footer a[href="/terms"], footer a[href$="/terms"]')).toHaveCountGreaterThan(0);
  await expect(page.locator('footer a[href="/privacy"], footer a[href$="/privacy"]')).toHaveCountGreaterThan(0);
});
