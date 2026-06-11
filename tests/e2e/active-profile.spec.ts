import { test, expect } from "@playwright/test";

/**
 * The active explorer is shared app state: choosing one on /profiles carries
 * into the trip view (and journal) without re-selecting.
 */
test("active explorer persists from profiles into the trip view", async ({ page }) => {
  await page.goto("/profiles");
  // Lenny is the little-mode explorer (not the default first profile).
  await page.getByRole("radio", { name: /lenny/i }).click();

  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Lenny's little-mode read-aloud copy shows without picking a profile again.
  await expect(page.getByText(/hold them up high/i)).toBeVisible();
});
