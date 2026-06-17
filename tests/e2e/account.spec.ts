import { test, expect } from "@playwright/test";

/** Account page shows the assistants hero + data-keep, and the keep CTA opens checkout. */
test("data-keep opens the checkout flow", async ({ page }) => {
  await page.goto("/account");
  await expect(page.getByTestId("account")).toBeVisible();
  await expect(page.getByRole("heading", { name: /connect your assistant/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /your data/i })).toBeVisible();

  await page.getByRole("button", { name: /keep my memories/i }).first().click();

  await expect(page).toHaveURL(/\/checkout\/mock/);
  await expect(page.getByTestId("mock-checkout")).toBeVisible();
});

test("settings exposes editable profile fields", async ({ page }) => {
  await page.goto("/account");
  const form = page.getByTestId("profile-form");
  await expect(form).toBeVisible();
  await expect(form.getByLabel(/^name$/i)).toBeVisible();
  await expect(form.getByLabel(/recovery email/i)).toBeVisible();

  // Editing enables Save, and saving reports success. Use a unique value so the
  // field is always dirty - the mock persists `name` in-memory across the shared
  // dev server, so a fixed value would leave Save disabled on repeat runs.
  await form.getByLabel(/^name$/i).fill(`The Test Family ${Date.now()}`);
  await form.getByRole("button", { name: /save changes/i }).click();
  await expect(form.getByText(/saved/i)).toBeVisible();
});

test("your-data table carries share / copy / archive actions", async ({ page }) => {
  await page.goto("/account");
  const table = page.getByTestId("data-table");
  await expect(table).toBeVisible();
  const row = page.getByTestId("data-row").first();
  await expect(row.getByRole("button", { name: /^share$/i })).toBeVisible();
  await expect(row.getByRole("button", { name: /^copy$/i })).toBeVisible();
  await expect(row.getByRole("button", { name: /archive|restore/i })).toBeVisible();
});

test("transaction history is a table with a trip column", async ({ page }) => {
  await page.goto("/account");
  const table = page.getByTestId("transactions-table");
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader", { name: /trip/i })).toBeVisible();
  await expect(table.getByRole("link", { name: /singapore/i }).first()).toBeVisible();
});

test("trips home links to account", async ({ page }) => {
  await page.goto("/trips");
  await page.getByRole("link", { name: /^account$/i }).click();
  await expect(page).toHaveURL(/\/account$/);
});
