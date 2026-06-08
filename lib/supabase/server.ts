import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { env, hasSupabase } from "@/lib/env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Server Supabase client for Server Components / route handlers. Returns `null`
 * when Supabase is not configured. Full session handling + route guards arrive
 * in Phase 1.
 */
export async function createClient() {
  if (!hasSupabase()) return null;
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component (read-only cookies); safe to ignore
          // when a middleware/route handler refreshes the session instead.
        }
      },
    },
  });
}
