import { test, expect } from "@playwright/test";

/** The during-trip companion screen renders the seeded "what's nearby" cards. */
test("companion page shows nearby options with allergy flags and a rain plan", async ({ page }) => {
  await page.goto("/trips/t_sg/companion");
  await expect(page.getByRole("heading", { name: /while you.re there/i })).toBeVisible();
  await expect(page.getByText(/Satay by the Bay/i).first()).toBeVisible();
  await expect(page.getByText(/Tree-nut allergy: flagged/i).first()).toBeVisible();
  await expect(page.getByText(/ArtScience Museum/i).first()).toBeVisible();
});

test("companion + chat-history mock routes serve the Walker seed", async ({ request, baseURL }) => {
  const comp = await request.get(`${baseURL}/api/trips/t_sg/companion`);
  expect(comp.ok()).toBeTruthy();
  const { cards } = await comp.json();
  expect(cards[0].options.flatMap((o: { flags: string[] }) => o.flags).join(" ")).toMatch(/tree-nut/i);

  const chat = await request.get(`${baseURL}/api/trips/t_sg/chat`);
  expect(chat.ok()).toBeTruthy();
  const { messages } = await chat.json();
  expect(messages.some((m: { kind: string }) => m.kind === "import_chip")).toBeTruthy();
});
