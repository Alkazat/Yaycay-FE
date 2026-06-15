import { test, expect } from "@playwright/test";

/**
 * Profile management: create explorers/grown-ups (via the per-column Create
 * modal) and set a parent/carer PIN. Names are unique per project so the shared
 * mock store can't cross-contaminate the phone/tablet/desktop runs.
 */

test("adds a child explorer", async ({ page }, testInfo) => {
  await page.goto("/profiles");
  await expect(page.getByTestId("users-library")).toBeVisible();

  const name = `Kid ${testInfo.project.name} ${Date.now()}`;
  await page.getByTestId("add-child").click();
  await page.getByTestId("profile-name").fill(name);
  // Modal defaults: child + band "explorer".
  await page.getByTestId("profile-save").click();

  await expect(page.getByTestId("profile-card").filter({ hasText: name })).toBeVisible();
});

test("adds a grown-up and sets their Grown-ups PIN", async ({ page }, testInfo) => {
  await page.goto("/profiles");

  const name = `GrownUp ${testInfo.project.name} ${Date.now()}`;
  await page.getByTestId("add-parent_carer").click();
  await page.getByTestId("profile-name").fill(name);
  // Type is locked to grown-up by the column it was opened from.
  await page.getByTestId("profile-save").click();

  const card = page.getByTestId("profile-card").filter({ hasText: name });
  await expect(card).toBeVisible();
  await expect(card.getByText("No PIN")).toBeVisible();

  await card.getByTestId("set-pin-open").click();
  await page.getByTestId("set-pin-input").fill("1357");
  await page.getByTestId("set-pin-confirm").fill("1357");
  await page.getByTestId("set-pin-save").click();

  await expect(card.getByText("PIN set")).toBeVisible();
});
