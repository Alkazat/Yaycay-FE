/**
 * Token endpoint. Exchanges a single-use authorization code (with PKCE proof)
 * for an opaque access token, and rotates refresh tokens. The access token is
 * what the MCP client sends as the Bearer to `/api/mcp`.
 */
import { randomToken, verifyPkce } from "@/lib/mcp/pkce";
import { oauthStore, type Grant } from "@/lib/mcp/store";
import { corsJson, corsPreflight, readForm } from "@/lib/mcp/http";

const ACCESS_TTL_MS = 60 * 60_000;

export function OPTIONS() {
  return corsPreflight();
}

function tokenResponse(grant: Grant) {
  return corsJson({
    access_token: grant.access_token,
    token_type: "Bearer",
    expires_in: Math.floor((grant.expires_at - Date.now()) / 1000),
    refresh_token: grant.refresh_token,
    scope: grant.scope,
  });
}

export async function POST(req: Request) {
  const form = await readForm(req);
  const grantType = form.grant_type;

  if (grantType === "authorization_code") {
    const code = await oauthStore.takeCode(form.code ?? "");
    if (!code) return corsJson({ error: "invalid_grant" }, { status: 400 });
    if (form.client_id && form.client_id !== code.client_id) {
      return corsJson({ error: "invalid_grant", error_description: "client mismatch" }, { status: 400 });
    }
    if (form.redirect_uri && form.redirect_uri !== code.redirect_uri) {
      return corsJson({ error: "invalid_grant", error_description: "redirect_uri mismatch" }, { status: 400 });
    }
    if (!verifyPkce(form.code_verifier ?? "", code.code_challenge)) {
      return corsJson({ error: "invalid_grant", error_description: "PKCE verification failed" }, { status: 400 });
    }

    const client = await oauthStore.getClient(code.client_id);
    const now = Date.now();
    const grant: Grant = {
      connection_id: `conn_${randomToken(16)}`,
      access_token: randomToken(32),
      refresh_token: randomToken(32),
      client_id: code.client_id,
      client_name: client?.client_name,
      scope: code.scope,
      user_id: code.user_id,
      supabase_access_token: code.supabase_access_token,
      supabase_refresh_token: code.supabase_refresh_token,
      status: "active",
      created_at: now,
      last_used_at: null,
      expires_at: now + ACCESS_TTL_MS,
    };
    await oauthStore.saveGrant(grant);
    return tokenResponse(grant);
  }

  if (grantType === "refresh_token") {
    const existing = await oauthStore.getGrantByRefreshToken(form.refresh_token ?? "");
    if (!existing) return corsJson({ error: "invalid_grant" }, { status: 400 });
    // Rotate both tokens but keep the connection identity.
    const rotated = await oauthStore.rotateTokens(existing.connection_id, {
      access_token: randomToken(32),
      refresh_token: randomToken(32),
      expires_at: Date.now() + ACCESS_TTL_MS,
    });
    if (!rotated) return corsJson({ error: "invalid_grant" }, { status: 400 });
    return tokenResponse(rotated);
  }

  return corsJson({ error: "unsupported_grant_type" }, { status: 400 });
}
