import { test, expect } from "@playwright/test";

/** Journal: add a memory and see it appear; plan route shows by tier. */
test("adds a journal memory", async ({ page }, testInfo) => {
  await page.goto("/trips/t_sg/journal");
  await expect(page.getByTestId("journal")).toBeVisible();

  // Unique per project so the shared mock store can't cross-contaminate runs.
  const note = `Memory ${testInfo.project.name} ${Date.now()}`;

  await page.getByRole("radio", { name: /4 stars/i }).click();
  await page.getByPlaceholder(/what made today special/i).fill(note);
  await page.getByRole("button", { name: /save memory/i }).click();

  // The saved entry shows in the memories list (scoped, so the textarea value
  // is not matched; first() tolerates the accumulating mock store).
  await expect(page.getByTestId("journal-entries").getByText(note).first()).toBeVisible();
});

test("plan route shows the our-AI planner for the full tier", async ({ page }) => {
  await page.goto("/trips/t_sg/plan");
  await expect(page.getByTestId("plan")).toBeVisible();
  await expect(page.getByRole("heading", { name: /plan with yaycay/i })).toBeVisible();
});
