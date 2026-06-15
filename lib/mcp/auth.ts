/**
 * Bearer verification for the MCP endpoint. Resolves the opaque access token to
 * an active grant and hands the tools the parent's Supabase token + scopes. A
 * revoked or expired grant resolves to null, so revocation takes effect on the
 * next request.
 *
 * The parent's captured Supabase access token is short-lived (~1h). We refresh
 * it on use from the stored refresh token so the connector keeps working instead
 * of 401-ing on every tool call once the captured token ages out.
 */
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { oauthStore } from "@/lib/mcp/store";
import { originFromRequest } from "@/lib/mcp/config";
import { env } from "@/lib/env";

/** True when a JWT is missing or (near-)expired, with a small clock-skew margin. */
function isExpired(jwt: string, skewSec = 120): boolean {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString()) as {
      exp?: number;
    };
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now() + skewSec * 1000;
  } catch {
    return true;
  }
}

/** Mint a fresh parent Supabase session from the stored refresh token, or null. */
async function refreshParentToken(
  refreshToken: string,
): Promise<{ access_token: string; refresh_token: string } | null> {
  if (!env.supabaseUrl || !env.supabaseAnonKey || !refreshToken) return null;
  try {
    const res = await fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: env.supabaseAnonKey, "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { access_token?: string; refresh_token?: string };
    if (!d.access_token || !d.refresh_token) return null;
    return { access_token: d.access_token, refresh_token: d.refresh_token };
  } catch {
    return null;
  }
}

export async function verifyMcpToken(
  req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;
  const grant = await oauthStore.getGrantByAccessToken(bearerToken);
  if (!grant) return undefined;

  // Best-effort "last seen" for the parent's connected-assistants screen.
  void oauthStore.touchLastUsed(bearerToken);

  // Keep the parent's Supabase token fresh. If it has expired, mint a new one
  // from the stored refresh token and persist it. If the refresh fails the
  // connection genuinely needs reconnecting; the contract call then 401s and the
  // tools return the "reconnect Yaycay" guidance.
  let supabaseAccess = grant.supabase_access_token;
  if (isExpired(supabaseAccess)) {
    const refreshed = await refreshParentToken(grant.supabase_refresh_token);
    if (refreshed) {
      supabaseAccess = refreshed.access_token;
      void oauthStore.updateParentTokens(
        grant.connection_id,
        refreshed.access_token,
        refreshed.refresh_token,
      );
    }
  }

  return {
    token: bearerToken,
    clientId: grant.client_id,
    scopes: grant.scope.split(" ").filter(Boolean),
    expiresAt: Math.floor(grant.expires_at / 1000),
    extra: {
      origin: originFromRequest(req),
      accessToken: supabaseAccess,
      userId: grant.user_id,
      connectionId: grant.connection_id,
    },
  };
}
