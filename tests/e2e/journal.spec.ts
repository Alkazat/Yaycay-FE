import { test, expect } from "@playwright/test";

/** Journal: add a memory and see it appear; plan route shows by tier. */
test("adds a journal memory", async ({ page }) => {
  await page.goto("/trips/t_sg/journal");
  await expect(page.getByTestId("journal")).toBeVisible();

  // Rate it and write a note.
  await page.getByRole("radio", { name: /4 stars/i }).click();
  await page.getByPlaceholder(/what made today special/i).fill("Playwright was here.");
  await page.getByRole("button", { name: /save memory/i }).click();

  await expect(page.getByText(/playwright was here/i)).toBeVisible();
});

test("plan route shows the our-AI planner for the full tier", async ({ page }) => {
  await page.goto("/trips/t_sg/plan");
  await expect(page.getByTestId("plan")).toBeVisible();
  await expect(page.getByRole("heading", { name: /plan with yaycay/i })).toBeVisible();
});
