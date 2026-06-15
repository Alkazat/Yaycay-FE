import { test, expect } from "@playwright/test";

/** The dotted add-tile opens the create modal with the free/paid plan choice. */
test("new-trip tile opens the create modal with plan choice", async ({ page }) => {
  await page.goto("/trips");
  await expect(page.getByTestId("trips-grid")).toBeVisible();

  await page.getByTestId("new-trip-tile").click();

  const dialog = page.getByRole("dialog", { name: /new trip/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/choose your plan/i)).toBeVisible();
  await expect(dialog.getByText(/single day/i)).toBeVisible();
  await expect(dialog.getByText(/US\$129/i)).toBeVisible();
  await expect(dialog.getByText(/US\$59/i)).toBeVisible();
  // Default plan is free.
  await expect(dialog.getByRole("button", { name: /create my day \(free\)/i })).toBeVisible();
});
