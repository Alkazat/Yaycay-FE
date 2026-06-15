// Privileged Supabase client for the OAuth authorization-server tables
// (oauth_clients, oauth_codes, oauth_grants). SERVER-ONLY: never import into a
// client component.
//
// Prefers a LEAST-PRIVILEGE key when present: OAUTH_DB_KEY is a JWT whose `role`
// claim is `oauth_store` (BE migration 0027), a Postgres role scoped by RLS to
// just the three oauth_* tables. If it leaks it cannot touch anything else.
//
// Gateway nuance: Supabase's gateway only accepts a RECOGNISED project key in
// the `apikey` header (anon/service), while PostgREST takes the ROLE from the
// `Authorization` bearer. So with the scoped key we pass apikey = anon and
// supply the oauth_store JWT as the bearer via the `accessToken` hook. Without
// OAUTH_DB_KEY we fall back to the service-role key (apikey + bearer), so this is
// a safe opt-in. Every key here is server-only and must never be NEXT_PUBLIC_.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const oauthDbKey = process.env.OAUTH_DB_KEY ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * True when a privileged client can be built. The scoped path needs the anon key
 * too (it rides as the gateway `apikey`); the fallback needs the service role.
 */
export function hasServiceRole(): boolean {
  if (env.supabaseUrl.length === 0) return false;
  if (oauthDbKey.length > 0) return env.supabaseAnonKey.length > 0;
  return serviceRoleKey.length > 0;
}

let cached: SupabaseClient | null = null;

/**
 * The privileged client (cached). Throws when unconfigured so a misconfigured
 * environment fails loudly rather than silently falling back to an unprivileged
 * client against service-role-only tables.
 */
export function serviceClient(): SupabaseClient {
  if (!hasServiceRole()) {
    throw new Error("OAuth store key not configured (OAUTH_DB_KEY+anon, or SUPABASE_SERVICE_ROLE_KEY).");
  }
  if (!cached) {
    cached = oauthDbKey
      ? // Scoped role: apikey = anon (gateway-recognised), Authorization bearer =
        // the oauth_store JWT (PostgREST reads the role from it).
        createClient(env.supabaseUrl, env.supabaseAnonKey, {
          accessToken: async () => oauthDbKey,
        })
      : // Fallback: service-role key as both apikey and bearer.
        createClient(env.supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
  }
  return cached;
}
