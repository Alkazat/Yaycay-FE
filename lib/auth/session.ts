import { createClient } from "@/lib/supabase/client";

/**
 * The signed-in user's Supabase access token (JWT), or null when not configured
 * / not signed in. Passed as the `Authorization: Bearer` for authenticated live
 * API calls; public endpoints fall back to the anon key in `apiFetch`.
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}
