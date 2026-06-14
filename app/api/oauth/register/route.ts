/**
 * Dynamic Client Registration (RFC 7591). MCP clients self-register with no
 * manual setup, which is what makes "add the connector" one step. Clients are
 * public (PKCE, no secret); we only persist their declared redirect URIs.
 */
import { randomToken } from "@/lib/mcp/pkce";
import { oauthStore, type RegisteredClient } from "@/lib/mcp/store";
import { corsJson, corsPreflight } from "@/lib/mcp/http";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return corsJson({ error: "invalid_client_metadata" }, { status: 400 });
  }

  const redirectUris = Array.isArray(body.redirect_uris)
    ? (body.redirect_uris as unknown[]).map(String)
    : [];
  if (redirectUris.length === 0) {
    return corsJson(
      { error: "invalid_redirect_uri", error_description: "redirect_uris is required" },
      { status: 400 },
    );
  }
  for (const uri of redirectUris) {
    try {
      new URL(uri);
    } catch {
      return corsJson(
        { error: "invalid_redirect_uri", error_description: `not a URL: ${uri}` },
        { status: 400 },
      );
    }
  }

  const client: RegisteredClient = {
    client_id: `yc_${randomToken(16)}`,
    client_name: body.client_name ? String(body.client_name) : undefined,
    redirect_uris: redirectUris,
    created_at: Date.now(),
  };
  await oauthStore.saveClient(client);

  return corsJson(
    {
      client_id: client.client_id,
      client_name: client.client_name,
      redirect_uris: client.redirect_uris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    },
    { status: 201 },
  );
}
