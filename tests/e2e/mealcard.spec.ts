import { test, expect } from "@playwright/test";

/** Day 2's Satay lunch shows the allergy meal card, bilingual ask-the-kitchen, and reminder. */
test("day 2 lunch renders the allergy meal card + bilingual ask-the-kitchen", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Jump to Day 2 ("Explorers"), the hero day. The day chips are tabs inside the
  // "Trip days" tablist (scoped to avoid the kid-view "Explorers" tab).
  await page
    .getByRole("tablist", { name: /trip days/i })
    .getByRole("tab", { name: /explorers/i })
    .click();

  // Allergy state is a text label, never colour alone.
  await expect(page.getByText(/Tree-nut allergy: flagged/i).first()).toBeVisible();
  await expect(page.getByTestId("meal-card").first()).toBeVisible();

  // Bilingual ask-the-kitchen card (English phrase + Mandarin label).
  await expect(page.getByTestId("ask-kitchen").first()).toBeVisible();
  await expect(page.getByText(/nuts or nut oils/i).first()).toBeVisible();

  // Pre-order reminder.
  await expect(page.getByTestId("meal-reminder").first()).toBeVisible();
  await expect(page.getByText(/before you order/i).first()).toBeVisible();
});
