import { test, expect } from "@playwright/test";
import { seedExplorer } from "./_helpers";

/** A2: ticking the day's activities completes the day. */
test("progress: ticking activities completes the day", async ({ page }) => {
  await seedExplorer(page);
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();
  await expect(page.getByTestId("done-check").first()).toBeVisible();

  // Retry the whole tick-and-check: a controlled checkbox can ignore an early
  // click before React has wired its onChange (hydration race).
  await expect(async () => {
    const checks = page.getByTestId("done-check").locator("input[type=checkbox]");
    const n = await checks.count();
    for (let i = 0; i < n; i++) {
      const box = checks.nth(i);
      if (!(await box.isChecked())) await box.click();
    }
    await expect(page.getByTestId("day-complete")).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15000 });
});

// The mock stars/packing stores are shared across the 3 viewport projects on one
// server, so these assert "at least one" / use unique names rather than exact
// state, tolerating accumulation.

/** B3: reveal and claim the day's star challenge. */
test("stars: claim the day's star challenge", async ({ page }) => {
  await seedExplorer(page);
  await page.goto("/trips/t_sg");
  const challenge = page.getByTestId("star-challenge");
  await expect(challenge).toBeVisible();

  const reveal = challenge.getByRole("button", { name: /show the answer/i });
  if (await reveal.count()) await reveal.click();
  const claim = challenge.getByRole("button", { name: /claim my star/i });
  if (await claim.count()) await claim.click();

  // Either we just claimed, or it was already claimed in another project run.
  await expect(page.getByTestId("star-count")).toContainText(/[1-9]/);
});

/** B2: a little explorer can play and win the mini-game. */
test("mini-game: little explorer plays and wins", async ({ page }) => {
  await seedExplorer(page);
  await page.goto("/trips/t_sg");
  await expect(page.getByTestId("trip-view")).toBeVisible();

  // Mini-games are a little-explorer feature by default; switch to Lenny to play.
  await page.getByRole("radio", { name: /lenny/i }).click();
  await page.getByTestId("game-launch").click();
  await expect(page.getByTestId("game-overlay")).toBeVisible();

  const tiles = page.getByTestId("game-tile");
  const n = await tiles.count();
  for (let i = 0; i < n; i++) await tiles.nth(i).click();

  await expect(page.getByTestId("game-win")).toBeVisible();
  await page.getByRole("button", { name: /all done/i }).click();
});

/** B4: add a packing item. */
test("packing: add an item", async ({ page }, testInfo) => {
  await page.goto("/trips/t_sg/packing");
  await expect(page.getByTestId("packing")).toBeVisible();

  // Unique so the shared store can't cause a strict-mode collision.
  const item = `Beach towel ${testInfo.project.name} ${Date.now()}`;
  await page
    .getByLabel(/add to/i)
    .first()
    .fill(item);
  await page.getByRole("button", { name: /^add$/i }).first().click();
  await expect(page.getByText(item).first()).toBeVisible();
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
