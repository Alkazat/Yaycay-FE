/**
 * Bearer verification for the MCP endpoint. Resolves the opaque access token to
 * an active grant and hands the tools the parent's Supabase token + scopes. A
 * revoked or expired grant resolves to null, so revocation takes effect on the
 * next request.
 */
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { oauthStore } from "@/lib/mcp/store";
import { originFromRequest } from "@/lib/mcp/config";

export async function verifyMcpToken(
  req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;
  const grant = await oauthStore.getGrantByAccessToken(bearerToken);
  if (!grant) return undefined;

  // Best-effort "last seen" for the parent's connected-assistants screen.
  void oauthStore.touchLastUsed(bearerToken);

  return {
    token: bearerToken,
    clientId: grant.client_id,
    scopes: grant.scope.split(" ").filter(Boolean),
    expiresAt: Math.floor(grant.expires_at / 1000),
    extra: {
      origin: originFromRequest(req),
      accessToken: grant.supabase_access_token,
      userId: grant.user_id,
      connectionId: grant.connection_id,
    },
  };
}
