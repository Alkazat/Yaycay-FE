import { test, expect } from "@playwright/test";

/** The per-tile ⋯ menu offers Share / Duplicate / Archive, and Share mints a link. */
test("trip tile menu shares a read-only link", async ({ page }) => {
  await page.goto("/trips");
  await expect(page.getByTestId("trips-grid")).toBeVisible();

  // Open the overflow menu on the first trip tile.
  await page.getByTestId("trip-menu-button").first().click();
  const menu = page.getByTestId("trip-menu").first();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: /share/i })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: /duplicate/i })).toBeVisible();
  await expect(menu.getByRole("menuitem", { name: /archive/i })).toBeVisible();

  // Share opens the modal; creating a link surfaces a copyable URL.
  await menu.getByRole("menuitem", { name: /share/i }).click();
  const dialog = page.getByRole("dialog", { name: /share/i });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel(/email/i).fill("friend@example.com");
  await dialog.getByRole("button", { name: /create link/i }).click();

  await expect(dialog.getByTestId("share-result")).toBeVisible();
  await expect(dialog.getByLabel(/shareable link/i)).toHaveValue(/\/shared\//);
});
