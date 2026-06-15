import { test, expect } from "@playwright/test";

/** Account page shows the assistants hero + data-keep, and the keep CTA opens checkout. */
test("data-keep opens the checkout flow", async ({ page }) => {
  await page.goto("/account");
  await expect(page.getByTestId("account")).toBeVisible();
  await expect(page.getByRole("heading", { name: /connected assistants/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /your data/i })).toBeVisible();

  await page.getByRole("button", { name: /keep my memories/i }).first().click();

  await expect(page).toHaveURL(/\/checkout\/mock/);
  await expect(page.getByTestId("mock-checkout")).toBeVisible();
});

test("trips home links to account", async ({ page }) => {
  await page.goto("/trips");
  await page.getByRole("link", { name: /^account$/i }).click();
  await expect(page).toHaveURL(/\/account$/);
});
