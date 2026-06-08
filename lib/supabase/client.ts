"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, hasSupabase } from "@/lib/env";

/**
 * Browser Supabase client (auth + realtime). Returns `null` when Supabase is
 * not configured so the Phase 0 scaffold runs without credentials. Auth wiring
 * (magic link + 2FA) lands in Phase 1.
 */
export function createClient() {
  if (!hasSupabase()) return null;
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
