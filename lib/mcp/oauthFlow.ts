/**
 * Shared logic for the authorization-code flow: validating the incoming
 * `/authorize` request and resolving the signed-in parent's Supabase session.
 */
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/env";
import { oauthStore, type RegisteredClient } from "@/lib/mcp/store";
import { SUPPORTED_SCOPES, DEFAULT_SCOPE } from "@/lib/mcp/config";

export interface AuthRequest {
  client: RegisteredClient;
  redirect_uri: string;
  code_challenge: string;
  scope: string;
  state: string;
}

export type ValidationResult =
  | { ok: true; req: AuthRequest }
  | { ok: false; error: string; description: string };

/** Validate an `/authorize` request against the registered client + OAuth 2.1 rules. */
export async function validateAuthRequest(p: URLSearchParams): Promise<ValidationResult> {
  const fail = (error: string, description: string): ValidationResult => ({
    ok: false,
    error,
    description,
  });

  if (p.get("response_type") !== "code") {
    return fail("unsupported_response_type", "only response_type=code is supported");
  }
  const clientId = p.get("client_id");
  if (!clientId) return fail("invalid_request", "client_id is required");
  const client = await oauthStore.getClient(clientId);
  if (!client) return fail("invalid_client", "unknown client_id");

  const redirectUri = p.get("redirect_uri") ?? client.redirect_uris[0];
  if (!client.redirect_uris.includes(redirectUri)) {
    return fail("invalid_request", "redirect_uri is not registered for this client");
  }

  if (p.get("code_challenge_method") !== "S256") {
    return fail("invalid_request", "code_challenge_method must be S256");
  }
  const codeChallenge = p.get("code_challenge");
  if (!codeChallenge) return fail("invalid_request", "code_challenge is required");

  // Reduce the requested scope to what we actually support.
  const requested = (p.get("scope") ?? DEFAULT_SCOPE).split(/\s+/).filter(Boolean);
  const granted = requested.filter((s) => (SUPPORTED_SCOPES as readonly string[]).includes(s));
  const scope = (granted.length ? granted : SUPPORTED_SCOPES).join(" ");

  return {
    ok: true,
    req: {
      client,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      scope,
      state: p.get("state") ?? "",
    },
  };
}

export interface ParentSession {
  user_id: string;
  access_token: string;
  refresh_token: string;
}

/**
 * The signed-in parent, or null if not signed in. When Supabase is not
 * configured (CI / local mock) we return a stand-in session so the connector
 * flow can be exercised end to end against the in-repo mock contract.
 */
export async function parentSession(): Promise<ParentSession | null> {
  if (!hasSupabase()) {
    return { user_id: "mock-parent", access_token: "", refresh_token: "" };
  }
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    user_id: user.id,
    access_token: session?.access_token ?? "",
    refresh_token: session?.refresh_token ?? "",
  };
}
