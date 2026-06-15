// Service-role Supabase client. SERVER-ONLY: this bypasses Row-Level Security,
// so it must never be imported into client components. It is the only client
// allowed to touch the OAuth authorization-server tables (oauth_clients,
// oauth_codes, oauth_grants), which are locked to the service role by RLS - see
// BE migration 0022_oauth.sql and docs/handoff/MCP-OAUTH-AS-SCOPING.md.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Not a NEXT_PUBLIC_ var on purpose: the service-role key must never reach the
// browser bundle.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** True when the service-role client can be built (URL + secret present). */
export function hasServiceRole(): boolean {
  return env.supabaseUrl.length > 0 && serviceRoleKey.length > 0;
}

let cached: SupabaseClient | null = null;

/**
 * The service-role client (cached). Throws when unconfigured so a misconfigured
 * environment fails loudly rather than silently falling back to an unprivileged
 * client against service-role-only tables.
 */
export function serviceClient(): SupabaseClient {
  if (!hasServiceRole()) {
    throw new Error("Service role not configured (SUPABASE_SERVICE_ROLE_KEY).");
  }
  if (!cached) {
    cached = createClient(env.supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
