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

/**
 * Sign the current user out: revokes the Supabase session and clears any
 * persisted query cache from localStorage. After this call, redirect the user
 * to the login route so in-memory state is fully dropped.
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    // Best-effort: always proceed to clear local state.
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("yaycay.query-cache");
  }
}
