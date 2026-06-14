/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728). Tells an MCP client which
 * authorization server guards the Yaycay MCP endpoint. Yaycay is its own AS, so
 * the issuer is this same origin.
 */
import { originFromRequest, resourceUrl, SUPPORTED_SCOPES } from "@/lib/mcp/config";
import { corsJson, corsPreflight } from "@/lib/mcp/http";

export function OPTIONS() {
  return corsPreflight();
}

export function GET(req: Request) {
  const origin = originFromRequest(req);
  return corsJson({
    resource: resourceUrl(origin),
    authorization_servers: [origin],
    scopes_supported: [...SUPPORTED_SCOPES],
    bearer_methods_supported: ["header"],
  });
}
