import { test, expect } from "@playwright/test";

/**
 * Profile management: create explorers/grown-ups and set a parent/carer PIN. Names
 * are unique per project so the shared mock store can't cross-contaminate the
 * phone/tablet/desktop runs.
 */

test("adds a child explorer", async ({ page }, testInfo) => {
  await page.goto("/profiles");
  await expect(page.getByTestId("manage-profiles")).toBeVisible();

  const name = `Kid ${testInfo.project.name} ${Date.now()}`;
  await page.getByTestId("add-profile").click();
  await page.getByTestId("profile-name").fill(name);
  // Defaults: type "child", band "explorer".
  await page.getByTestId("profile-save").click();

  await expect(page.getByTestId("profile-card").filter({ hasText: name })).toBeVisible();
});

test("adds a grown-up and sets their Grown-ups PIN", async ({ page }, testInfo) => {
  await page.goto("/profiles");

  const name = `GrownUp ${testInfo.project.name} ${Date.now()}`;
  await page.getByTestId("add-profile").click();
  await page.getByTestId("profile-name").fill(name);
  await page.getByLabel("Who is this?").selectOption({ label: "A grown-up" });
  await page.getByTestId("profile-save").click();

  const card = page.getByTestId("profile-card").filter({ hasText: name });
  await expect(card).toBeVisible();
  // A fresh parent/carer has no PIN yet.
  await expect(card.getByText("No PIN")).toBeVisible();

  await card.getByTestId("set-pin-open").click();
  await page.getByTestId("set-pin-input").fill("1357");
  await page.getByTestId("set-pin-confirm").fill("1357");
  await page.getByTestId("set-pin-save").click();

  // The PIN is now configured (the dialog never returns the PIN itself).
  await expect(card.getByText("PIN set")).toBeVisible();
});
