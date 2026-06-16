import type { Page } from "@playwright/test";

/**
 * Seed the active explorer so a trip opens straight into the day-by-day book,
 * skipping the "Who's exploring?" cover. The cover is the fresh-entry surface
 * (no explorer chosen yet) and is exercised by `cover.spec.ts`; the rest of the
 * suite asserts in-book behaviour, so it pre-selects an explorer here.
 *
 * Must be called BEFORE `page.goto(...)` - it installs an init script that runs
 * before the app boots. Defaults to Savy (the Big Explorer / explorer_plus), the
 * historical default the in-book specs assume.
 */
export async function seedExplorer(page: Page, id = "p_savy"): Promise<void> {
  await page.addInitScript((pid) => {
    try {
      localStorage.setItem("yaycay.activeProfileId", pid as string);
    } catch {
      // localStorage unavailable - the cover will show; specs that need the book
      // should run in a context where storage works.
    }
  }, id);
}
