import { test, expect } from "@playwright/test";

/**
 * The Exploring experience opens with a warm "Who's exploring?" cover (emulating
 * the gold standard): a family title, a tap-your-name picker, the trip dates and a
 * live countdown. Picking a name selects that explorer and hands off to the book.
 */
test("trip cover: shows on fresh entry and picking enters the book", async ({ page }) => {
  await page.goto("/trips/t_sg");

  const cover = page.getByTestId("trip-cover");
  await expect(cover).toBeVisible();
  await expect(cover.getByRole("heading", { name: /adventure/i })).toBeVisible();
  // All three explorers are offered by name.
  await expect(cover.getByRole("button", { name: /savy/i })).toBeVisible();
  await expect(cover.getByRole("button", { name: /tay/i })).toBeVisible();
  await expect(cover.getByRole("button", { name: /lenny/i })).toBeVisible();

  // Pick the Big Explorer; the cover hands off to the day-by-day book.
  await cover.getByRole("button", { name: /savy/i }).click();
  await expect(page.getByTestId("trip-view")).toBeVisible();
  await expect(page.getByTestId("trip-day")).toBeVisible();
});

test("trip cover: a chosen explorer skips the cover on return", async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("yaycay.activeProfileId", "p_lenny");
    } catch {
      /* ignore */
    }
  });
  await page.goto("/trips/t_sg");

  // No cover - straight into Lenny's little-explorer book.
  await expect(page.getByTestId("trip-cover")).toHaveCount(0);
  await expect(page.getByTestId("trip-view")).toBeVisible();
  await expect(page.getByText(/hold them up high/i)).toBeVisible();
});
