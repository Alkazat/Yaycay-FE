/**
 * MCP + OAuth configuration.
 *
 * Yaycay hosts a remote MCP server at `/api/mcp` so a parent can connect their
 * own AI assistant (Claude, ChatGPT/Codex, Gemini) and have it plan a trip
 * through the Yaycay contract on their behalf. The server is OAuth-protected:
 * Yaycay acts as the authorization server and delegates the human sign-in to
 * the existing Supabase auth at `/auth`.
 *
 * All URLs are derived from the request origin at runtime (so the same build
 * works on any host); `env.siteUrl` is only the fallback when no forwarding
 * headers are present.
 */
import { env } from "@/lib/env";

/** Path the MCP transport is mounted at (the value placed in connector config). */
export const MCP_PATH = "/api/mcp";

/** OAuth scopes the connector can request. Kept coarse on purpose. */
export const SCOPES = {
  /** Read trips, content, packing, grown-ups guide, stars. */
  read: "yaycay.read",
  /** Use the planner (send planning messages / ingest). */
  plan: "yaycay.plan",
} as const;

export const SUPPORTED_SCOPES = [SCOPES.read, SCOPES.plan] as const;
export const DEFAULT_SCOPE = SUPPORTED_SCOPES.join(" ");

/**
 * Resolve the public origin of the current request. Honours the standard
 * forwarding headers set by Vercel / proxies, falling back to the configured
 * site URL so server-side defaults still work in tests and local dev.
 */
export function originFromRequest(req: Request): string {
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return env.siteUrl.replace(/\/$/, "");
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** The canonical MCP resource identifier (what tokens are audience-bound to). */
export function resourceUrl(origin: string): string {
  return `${origin}${MCP_PATH}`;
}
