/**
 * Centralised access to the public runtime config. Only NEXT_PUBLIC_* values
 * are readable in the browser. Missing values are tolerated in this Phase 0
 * scaffold (the app falls back to the in-repo mock contract and renders without
 * a live Supabase/Stripe), but each getter documents what it gates.
 */

export const env = {
  /** Supabase project URL (auth + realtime). */
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  /** Supabase anon key. */
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /**
   * BE API base. Empty string => use the in-repo mock contract via local
   * /api/* route handlers. Set this once the real contract is live.
   */
  apiBase: process.env.NEXT_PUBLIC_API_BASE ?? "",
  /** Stripe publishable key (Checkout sessions are created by BE). */
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  /** This app's public origin. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/** True when a live BE contract host is configured. */
export function hasLiveApi(): boolean {
  return env.apiBase.trim().length > 0;
}

/** True when Supabase auth is configured. */
export function hasSupabase(): boolean {
  return env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
}
