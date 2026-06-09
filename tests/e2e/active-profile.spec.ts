import { test, expect } from "@playwright/test";

/**
 * The active explorer is shared app state: choosing one on /profiles carries
 * into the trip view (and journal) without re-selecting.
 */
test("active explorer persists from profiles into the trip view", async ({ page }) => {
  await page.goto("/profiles");
  // Mara is the explorer_plus profile (not the default first profile).
  await page.getByRole("radio", { name: /mara/i }).click();

  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // explorer_plus content (a quiz) shows without picking a profile again.
  await expect(page.getByText(/quiz:/i).first()).toBeVisible();
  // And Mara is the active explorer in the trip view switcher.
  await expect(page.getByRole("radio", { name: /mara/i })).toBeChecked();
});
