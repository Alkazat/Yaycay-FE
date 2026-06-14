/** Small helpers for the OAuth/metadata route handlers. */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-protocol-version",
};

/** JSON response with the CORS headers browser-based MCP clients require. */
export function corsJson(body: unknown, init?: { status?: number }): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json", ...CORS },
  });
}

/** Preflight handler for the metadata + token endpoints. */
export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

/** Read an `application/x-www-form-urlencoded` or JSON body into a flat record. */
export async function readForm(req: Request): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const json = (await req.json()) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(json).map(([k, v]) => [k, String(v)]));
  }
  const text = await req.text();
  return Object.fromEntries(new URLSearchParams(text));
}
