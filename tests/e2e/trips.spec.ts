import { test, expect, type Page } from "@playwright/test";

/**
 * Trips home -> trip view journey, exercising the renderer, the user-types view
 * gate (children locked to Explorers; Grown-ups behind the parent/carer PIN) and
 * band-driven content (challenge/quiz gating follows the active profile).
 */

/** Activate the parent/carer (Mum) and clear the Grown-ups PIN gate (demo PIN 1234). */
async function unlockGrownups(page: Page) {
  await page.getByRole("radio", { name: /mum/i }).click();
  await page.getByRole("tab", { name: /grown-ups/i }).click();
  await page.getByTestId("pin-input").fill("1234");
  await page.getByTestId("pin-submit").click();
}

test("children are locked to Explorers; the parent/carer PIN unlocks Grown-ups", async ({ page }) => {
  await page.goto("/trips");

  await expect(page.getByRole("heading", { name: /your trips/i })).toBeVisible();
  await expect(page.getByTestId("trips-grid")).toBeVisible();

  // Open the Singapore trip.
  await page
    .getByRole("link", { name: /singapore/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/trips\/t_sg$/);
  await expect(page.getByTestId("trip-view")).toBeVisible();
  await expect(page.getByTestId("trip-day")).toBeVisible();
  await expect(page.getByText(/beach treasure hunt/i)).toBeVisible();

  // Default lands on a child explorer: the Grown-ups tab is absent (not disabled).
  await expect(page.getByRole("tab", { name: /grown-ups/i })).toHaveCount(0);

  // Activate the parent/carer, tap Grown-ups, and pass the PIN gate.
  await unlockGrownups(page);

  // Grown-ups content is now revealed.
  await expect(page.getByText(/safety:/i).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /grown-ups guide/i })).toBeVisible();
});

test("a wrong PIN is rejected and keeps Grown-ups locked", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  await page.getByRole("radio", { name: /mum/i }).click();
  await page.getByRole("tab", { name: /grown-ups/i }).click();
  await page.getByTestId("pin-input").fill("0000");
  await page.getByTestId("pin-submit").click();

  // The gate stays open with an error; no Grown-ups content leaks.
  await expect(page.getByTestId("pin-error")).toBeVisible();
  await expect(page.getByRole("heading", { name: /grown-ups guide/i })).toHaveCount(0);
});

test("profile switch changes the kid copy", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Little explorer (Lenny) gets the read-aloud variant body.
  await page.getByRole("radio", { name: /lenny/i }).click();
  await expect(page.getByText(/hold them up high/i)).toBeVisible();
});

test("explorer bands gate the challenge + bonus quiz by profile", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Default is the Big Explorer (Savy, explorer_plus): typed challenge + bonus quiz.
  const reveal = page.getByRole("button", { name: /reveal the answer/i }).first();
  await expect(reveal).toBeVisible();
  await reveal.click();
  await expect(page.getByRole("button", { name: /hide answer/i }).first()).toBeVisible();
  await expect(page.getByText(/quiz:/i).first()).toBeVisible();

  // Little explorer (Lenny): the typed challenge is hidden, read-aloud copy shows.
  await page.getByRole("radio", { name: /lenny/i }).click();
  await expect(page.getByText(/hold them up high/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /reveal the answer/i })).toHaveCount(0);
});

test("grown-ups view shows the allergy protocol banner", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  await unlockGrownups(page);

  await expect(page.getByText(/allergy protocol/i)).toBeVisible();
  await expect(page.getByText(/epipen/i)).toBeVisible();
});
