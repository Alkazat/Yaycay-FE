/**
 * Parent self-service: list the assistants connected to my account. Backed by
 * the OAuth grant store, which is exactly what `verifyMcpToken` checks, so the
 * list reflects live access.
 */
import { oauthStore } from "@/lib/mcp/store";
import { parentSession } from "@/lib/mcp/oauthFlow";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await parentSession();
  if (!session) return new Response(JSON.stringify({ error: "not signed in" }), { status: 401 });
  const connections = await oauthStore.listConnectionsByUser(session.user_id);
  return Response.json({ connections });
}
