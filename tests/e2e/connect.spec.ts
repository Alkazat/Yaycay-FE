import { test, expect } from "@playwright/test";

/** The connect page surfaces the MCP URL and per-assistant setup. */
test("connect page shows the MCP URL and assistant cards", async ({ page }) => {
  await page.goto("/connect");

  await expect(page.getByRole("heading", { name: /connect your ai to yaycay/i })).toBeVisible();

  // The MCP URL is rendered and points at /api/mcp.
  await expect(page.getByText("/api/mcp").first()).toBeVisible();

  // Each major assistant has a setup card.
  await expect(page.getByRole("heading", { name: /claude \(chat\)/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /chatgpt/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /gemini/i })).toBeVisible();
});

test("OAuth discovery metadata is served", async ({ request, baseURL }) => {
  const prm = await request.get(`${baseURL}/.well-known/oauth-protected-resource`);
  expect(prm.ok()).toBeTruthy();
  const prmBody = await prm.json();
  expect(prmBody.resource).toContain("/api/mcp");
  expect(Array.isArray(prmBody.authorization_servers)).toBeTruthy();

  const as = await request.get(`${baseURL}/.well-known/oauth-authorization-server`);
  expect(as.ok()).toBeTruthy();
  const asBody = await as.json();
  expect(asBody.code_challenge_methods_supported).toContain("S256");
  expect(asBody.token_endpoint).toContain("/api/oauth/token");
});

test("MCP endpoint rejects unauthenticated calls with a 401", async ({ request, baseURL }) => {
  const res = await request.post(`${baseURL}/api/mcp`, {
    headers: { "content-type": "application/json" },
    data: { jsonrpc: "2.0", id: 1, method: "tools/list" },
    failOnStatusCode: false,
  });
  expect(res.status()).toBe(401);
  expect(res.headers()["www-authenticate"]).toContain("resource_metadata");
});
