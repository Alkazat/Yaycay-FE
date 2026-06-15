/**
 * Yaycay remote MCP server (Streamable HTTP).
 *
 * A parent connects their own AI assistant here; the assistant calls the
 * Yaycay tools (list trips, read content, plan) as the parent. The endpoint is
 * OAuth-protected: an unauthenticated request gets a 401 pointing at the
 * protected-resource metadata (`/.well-known/oauth-protected-resource`), which
 * in turn advertises Yaycay as the authorization server.
 */
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { registerYaycayTools } from "@/lib/mcp/tools";
import { verifyMcpToken } from "@/lib/mcp/auth";

// Returned to the assistant on `initialize` so it speaks for Yaycay before it
// touches a tool: the brand voice, how Yaycay works, and the hard rule that
// trips are created in the app (not via this connector). Keep it short - it
// frames every conversation.
const INSTRUCTIONS = [
  "You are connected to Yaycay, the family-holiday companion that helps parents plan trips their kids will remember.",
  "",
  "Voice: warm, encouraging and plain-spoken, like a friend who's great with kids. No jargon. Be practical and reassuring.",
  "",
  "How Yaycay works:",
  "- A trip is a holiday the family owns in the Yaycay app (a destination + dates); Yaycay turns it into a day-by-day plan of age-appropriate moments.",
  "- You can READ trips and their content, and PLAN within an EXISTING trip (plan_trip).",
  "- You CANNOT create, buy or delete trips through this connector. If the family wants a NEW destination, call request_new_trip to give them the friendly steps + their dashboard link, then pause until they confirm it's added.",
  "",
  "Planning style: relaxed and realistic - a few good moments a day beat an over-stuffed schedule. Balance kid, shared and grown-up time, respect nap windows and any dietary/medical notes, and honour anything the family says they'd rather avoid.",
  "",
  "Start by calling list_trips to see what the family already has, then get_trip_brief for the chosen trip (who's travelling + the trip header) and get_trip_content to build on what's there. If a tool returns guidance (for example, asking the family to add a trip in the app), relay it warmly in your own words.",
].join("\n");

const handler = createMcpHandler(
  (server) => {
    registerYaycayTools(server);
  },
  { instructions: INSTRUCTIONS },
  // The transport is mounted at /api/mcp, so the handler's streamable endpoint
  // must match (its default is /mcp).
  { basePath: "/api" },
);

const authed = withMcpAuth(handler, verifyMcpToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { authed as GET, authed as POST, authed as DELETE };
