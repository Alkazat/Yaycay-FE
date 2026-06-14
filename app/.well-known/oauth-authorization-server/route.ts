/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414). Advertises the
 * authorization-code + PKCE flow Yaycay supports, plus dynamic client
 * registration so MCP clients can self-register with no manual setup.
 */
import { originFromRequest, SUPPORTED_SCOPES } from "@/lib/mcp/config";
import { corsJson, corsPreflight } from "@/lib/mcp/http";

export function OPTIONS() {
  return corsPreflight();
}

export function GET(req: Request) {
  const origin = originFromRequest(req);
  return corsJson({
    issuer: origin,
    authorization_endpoint: `${origin}/api/oauth/authorize`,
    token_endpoint: `${origin}/api/oauth/token`,
    registration_endpoint: `${origin}/api/oauth/register`,
    scopes_supported: [...SUPPORTED_SCOPES],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
  });
}
