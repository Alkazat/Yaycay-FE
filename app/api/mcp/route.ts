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

const handler = createMcpHandler(
  (server) => {
    registerYaycayTools(server);
  },
  undefined,
  // The transport is mounted at /api/mcp, so the handler's streamable endpoint
  // must match (its default is /mcp).
  { basePath: "/api" },
);

const authed = withMcpAuth(handler, verifyMcpToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { authed as GET, authed as POST, authed as DELETE };
