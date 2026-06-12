import { test, expect } from "@playwright/test";

/**
 * Core demo journey, run at phone/tablet/desktop (see playwright.config.ts).
 * Also asserts a touch hard-rule: the primary action meets the min tap target.
 */
test("demo builds a day and shows the countdown", async ({ page }) => {
  await page.goto("/demo");

  await expect(page.getByRole("heading", { name: /your family holiday/i })).toBeVisible();

  // Destination + date are prefilled; the explorer name is required.
  await page.getByLabel(/who is exploring/i).fill("Lenny");
  const build = page.getByRole("button", { name: /build my day/i });
  await expect(build).toBeVisible();

  // Touch hard-rule: primary control is at least ~44px tall.
  const box = await build.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

  await build.click();

  // The rendered day + countdown appear.
  await expect(page.getByTestId("demo-result")).toBeVisible();
  await expect(page.getByTestId("trip-day")).toBeVisible();
  await expect(page.getByText(/sleeps to go|sleep to go|adventure has begun/i)).toBeVisible();

  // Signup: enter email, capture it, then hand off to /auth with it prefilled.
  await page.getByLabel(/your email/i).fill("family@example.com");
  await page.getByRole("button", { name: /create my account/i }).click();
  await expect(page).toHaveURL(/\/auth\?/);
  await expect(page.getByText(/family@example\.com/i)).toBeVisible();
});

test("home links into the demo", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /try the free demo/i }).click();
  await expect(page).toHaveURL(/\/demo$/);
});
