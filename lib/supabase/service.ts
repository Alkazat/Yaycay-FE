// Privileged Supabase client for the OAuth authorization-server tables
// (oauth_clients, oauth_codes, oauth_grants). SERVER-ONLY: never import into a
// client component.
//
// Prefers a LEAST-PRIVILEGE key when present: OAUTH_DB_KEY is a JWT whose `role`
// claim is `oauth_store` (BE migration 0027), a Postgres role scoped by RLS to
// just the three oauth_* tables. If it leaks it cannot touch anything else.
// Falls back to SUPABASE_SERVICE_ROLE_KEY (full RLS bypass) so the store keeps
// working before the scoped role is rolled out. Either key is server-only and
// must never be a NEXT_PUBLIC_ var.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const oauthDbKey = process.env.OAUTH_DB_KEY ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
/** Scoped oauth_store key wins; service-role is the fallback. */
const privilegedKey = oauthDbKey || serviceRoleKey;

/** True when a privileged client can be built (URL + a scoped/service key). */
export function hasServiceRole(): boolean {
  return env.supabaseUrl.length > 0 && privilegedKey.length > 0;
}

let cached: SupabaseClient | null = null;

/**
 * The privileged client (cached). Throws when unconfigured so a misconfigured
 * environment fails loudly rather than silently falling back to an unprivileged
 * client against service-role-only tables.
 */
export function serviceClient(): SupabaseClient {
  if (!hasServiceRole()) {
    throw new Error("OAuth store key not configured (OAUTH_DB_KEY or SUPABASE_SERVICE_ROLE_KEY).");
  }
  if (!cached) {
    cached = createClient(env.supabaseUrl, privilegedKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
