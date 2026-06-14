/**
 * Authorization endpoint (OAuth 2.1 authorization-code + PKCE).
 *
 * GET  - validates the request, then either bounces an unauthenticated parent
 *        to `/auth` (returning here afterwards) or shows the consent screen at
 *        `/connect/authorize`.
 * POST - the consent screen's "Approve" action. Re-checks the session, mints a
 *        single-use code bound to the PKCE challenge, and redirects back to the
 *        client's redirect_uri.
 *
 * Consent is a real step on purpose: without it, a malicious client that
 * registered its own redirect_uri could silently obtain a code for any
 * signed-in parent (PKCE alone does not prevent that).
 */
import { randomToken } from "@/lib/mcp/pkce";
import { oauthStore } from "@/lib/mcp/store";
import { validateAuthRequest, parentSession } from "@/lib/mcp/oauthFlow";
import { originFromRequest } from "@/lib/mcp/config";

const CODE_TTL_MS = 5 * 60_000;

/** Append OAuth error params to the client's redirect_uri. */
function errorRedirect(redirectUri: string, state: string, error: string, description: string) {
  const u = new URL(redirectUri);
  u.searchParams.set("error", error);
  u.searchParams.set("error_description", description);
  if (state) u.searchParams.set("state", state);
  return Response.redirect(u.toString(), 302);
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const result = await validateAuthRequest(params);
  if (!result.ok) {
    // No trusted redirect target yet, so report the error directly.
    return new Response(`${result.error}: ${result.description}`, { status: 400 });
  }

  const origin = originFromRequest(req);
  const session = await parentSession();
  if (!session) {
    const next = `${origin}/api/oauth/authorize?${params.toString()}`;
    return Response.redirect(`${origin}/auth?next=${encodeURIComponent(next)}`, 302);
  }

  // Hand off to the consent screen, preserving the original request params.
  return Response.redirect(`${origin}/connect/authorize?${params.toString()}`, 302);
}

export async function POST(req: Request) {
  // Same-origin guard: this state-changing POST must originate from our consent
  // page, not a cross-site form.
  const origin = originFromRequest(req);
  const reqOrigin = req.headers.get("origin");
  if (reqOrigin && reqOrigin !== origin) {
    return new Response("cross-origin request rejected", { status: 403 });
  }

  const form = new URLSearchParams(await req.text());
  const result = await validateAuthRequest(form);
  if (!result.ok) return new Response(`${result.error}: ${result.description}`, { status: 400 });
  const { req: ar } = result;

  if (form.get("decision") !== "approve") {
    return errorRedirect(ar.redirect_uri, ar.state, "access_denied", "parent declined access");
  }

  const session = await parentSession();
  if (!session) return new Response("not signed in", { status: 401 });

  const code = randomToken(32);
  await oauthStore.saveCode({
    code,
    client_id: ar.client.client_id,
    redirect_uri: ar.redirect_uri,
    code_challenge: ar.code_challenge,
    scope: ar.scope,
    user_id: session.user_id,
    supabase_access_token: session.access_token,
    supabase_refresh_token: session.refresh_token,
    expires_at: Date.now() + CODE_TTL_MS,
  });

  const redirect = new URL(ar.redirect_uri);
  redirect.searchParams.set("code", code);
  if (ar.state) redirect.searchParams.set("state", ar.state);
  return Response.redirect(redirect.toString(), 302);
}
