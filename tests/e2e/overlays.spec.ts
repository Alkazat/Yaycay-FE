import { test, expect } from "@playwright/test";
import { seedExplorer } from "./_helpers";

/**
 * Tools (Map / Packing / Journal / While-you're-there) open as in-place overlays
 * over the book - you never navigate away from your day (the gold-standard feel).
 * The routes still exist for deep links; this asserts the in-book overlay path.
 */
test("tools open as in-place overlays over the book, then close", async ({ page }) => {
  await seedExplorer(page);
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Open Map from the in-book tool bar: it opens as an overlay, URL unchanged.
  await page.getByRole("button", { name: /^map$/i }).click();
  const overlay = page.getByTestId("map-overlay");
  await expect(overlay).toBeVisible();
  await expect(overlay.getByTestId("map-scene")).toBeVisible();
  await expect(page).toHaveURL(/\/trips\/t_sg$/);

  // Close returns to the book; no navigation happened.
  await overlay.getByRole("button", { name: /close/i }).click();
  await expect(page.getByTestId("map-overlay")).toHaveCount(0);
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Packing opens the same way.
  await page.getByRole("button", { name: /^packing$/i }).click();
  await expect(page.getByTestId("packing-overlay").getByTestId("packing")).toBeVisible();
});
