import { test, expect } from "@playwright/test";

/** A2: ticking the day's activities completes the day. */
test("progress: ticking activities completes the day", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  const checks = page.getByTestId("done-check").locator("input[type=checkbox]");
  const n = await checks.count();
  for (let i = 0; i < n; i++) await checks.nth(i).check();

  await expect(page.getByTestId("day-complete")).toBeVisible();
});

/** B3: reveal and claim the day's star challenge. */
test("stars: claim the day's star challenge", async ({ page }) => {
  await page.goto("/trips/t_sg");
  const challenge = page.getByTestId("star-challenge");
  await expect(challenge).toBeVisible();
  await challenge.getByRole("button", { name: /show the answer/i }).click();
  await challenge.getByRole("button", { name: /claim my star/i }).click();
  await expect(page.getByTestId("star-count")).toContainText(/1 star/i);
});

/** B2: play and win the mini-game, which grants a star. */
test("mini-game: win grants a star", async ({ page }) => {
  await page.goto("/trips/t_sg");
  await page.getByTestId("game-launch").click();
  await expect(page.getByTestId("game-overlay")).toBeVisible();

  const tiles = page.getByTestId("game-tile");
  const n = await tiles.count();
  for (let i = 0; i < n; i++) await tiles.nth(i).click();

  await expect(page.getByTestId("game-win")).toBeVisible();
  await page.getByRole("button", { name: /all done/i }).click();
  await expect(page.getByTestId("star-count")).toContainText(/1 star/i);
});

/** B4: packing tick + add. */
test("packing: tick and add an item", async ({ page }) => {
  await page.goto("/trips/t_sg/packing");
  await expect(page.getByTestId("packing")).toBeVisible();

  const firstCheckbox = page.locator('input[type=checkbox]').first();
  await firstCheckbox.check();
  await expect(firstCheckbox).toBeChecked();

  const adder = page.getByLabel(/add to/i).first();
  await adder.fill("Beach towel");
  await page.getByRole("button", { name: /^add$/i }).first().click();
  await expect(page.getByText(/beach towel/i)).toBeVisible();
});

/** B5: map renders geo pins. */
test("map: shows venue pins", async ({ page }) => {
  await page.goto("/trips/t_sg/map");
  await expect(page.getByTestId("map-scene")).toBeVisible();
  expect(await page.getByTestId("map-pin").count()).toBeGreaterThan(0);
});

/** C2: planning chat streams a reply. */
test("plan chat: streams a reply", async ({ page }) => {
  await page.goto("/trips/t_sg/plan");
  await expect(page.getByTestId("plan")).toBeVisible();
  await page.getByLabel(/message yaycay/i).fill("Add a quiet morning on day 3");
  await page.getByRole("button", { name: /^send$/i }).click();
  await expect(page.getByTestId("chat-log")).toContainText(/weave|day/i, { timeout: 10000 });
});
