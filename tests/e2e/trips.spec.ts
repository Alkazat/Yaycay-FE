import { test, expect } from "@playwright/test";

/**
 * Trips home -> trip view journey at phone/tablet/desktop, exercising the
 * renderer, the kid/grown-ups toggle, and profile switching.
 */
test("opens a trip and switches between explorer and grown-ups views", async ({ page }) => {
  await page.goto("/trips");

  await expect(page.getByRole("heading", { name: /your trips/i })).toBeVisible();
  const grid = page.getByTestId("trips-grid");
  await expect(grid).toBeVisible();

  // Open the Singapore trip.
  await page.getByRole("link", { name: /singapore/i }).first().click();
  await expect(page).toHaveURL(/\/trips\/t_sg$/);
  await expect(page.getByTestId("trip-view")).toBeVisible();
  await expect(page.getByTestId("trip-day")).toBeVisible();

  // Kid view shows a kid activity; grown-ups view shows the safety note.
  await expect(page.getByText(/beach treasure hunt/i)).toBeVisible();

  await page.getByRole("tab", { name: /grown-ups/i }).click();
  await expect(page.getByText(/safety:/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /grown-ups guide/i })).toBeVisible();
});

test("profile switch changes the kid copy", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Little explorer (Lenny) gets the read-aloud variant body.
  await page.getByRole("radio", { name: /lenny/i }).click();
  await expect(page.getByText(/hold them up high/i)).toBeVisible();
});

test("explorer modes: standard challenge, explorer+ quiz, little hides challenge", async ({
  page,
}) => {
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Default is the standard explorer: a typed challenge with a reveal toggle.
  const reveal = page.getByRole("button", { name: /reveal the answer/i }).first();
  await expect(reveal).toBeVisible();
  await reveal.click();
  await expect(page.getByRole("button", { name: /hide answer/i }).first()).toBeVisible();

  // Explorer+ surfaces the deeper quiz.
  await page.getByRole("tab", { name: /^explorer\+$/i }).click();
  await expect(page.getByText(/quiz:/i).first()).toBeVisible();

  // Little mode hides the typed challenge and shows read-aloud copy.
  await page.getByRole("tab", { name: /^little$/i }).click();
  await expect(page.getByText(/hold them up high/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /reveal the answer/i })).toHaveCount(0);
});

test("grown-ups view shows the allergy protocol banner", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await page.getByRole("tab", { name: /grown-ups/i }).click();
  await expect(page.getByText(/allergy protocol/i)).toBeVisible();
  await expect(page.getByText(/epipen/i)).toBeVisible();
});
