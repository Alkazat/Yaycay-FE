/**
 * Parent self-service: revoke a connected assistant. Revocation flips the
 * grant's status so `verifyMcpToken` rejects it on the next call (immediate
 * kill switch). Scoped to the signed-in parent's own connections.
 */
import { oauthStore } from "@/lib/mcp/store";
import { parentSession } from "@/lib/mcp/oauthFlow";
import { originFromRequest } from "@/lib/mcp/config";
import { readForm } from "@/lib/mcp/http";

export async function POST(req: Request) {
  // Same-origin guard for this state-changing call.
  const reqOrigin = req.headers.get("origin");
  if (reqOrigin && reqOrigin !== originFromRequest(req)) {
    return new Response(JSON.stringify({ error: "cross-origin rejected" }), { status: 403 });
  }

  const session = await parentSession();
  if (!session) return new Response(JSON.stringify({ error: "not signed in" }), { status: 401 });

  const form = await readForm(req);
  const connectionId = form.connection_id;
  if (!connectionId) {
    return new Response(JSON.stringify({ error: "connection_id required" }), { status: 400 });
  }

  const revoked = await oauthStore.revokeConnection(connectionId, session.user_id);
  if (!revoked) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
  return Response.json({ revoked: true });
}
