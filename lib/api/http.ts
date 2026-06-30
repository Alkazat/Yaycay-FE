import { env, hasLiveApi } from "@/lib/env";

/**
 * Per-endpoint routing for the hybrid period.
 *
 * Per Yaycay-BE `CONTRACT-STATUS.md` (v0.8), only some endpoints are actually
 * served by the live API; the rest are still backed by the in-repo mock route
 * handlers under `/api/*`. So an endpoint goes to the live BE only when BOTH
 * `NEXT_PUBLIC_API_BASE` is set AND the endpoint is marked `served`. Everything
 * else stays on the mock even once the API base is configured, until BE ships
 * that handler (then flip its flag).
 */
/**
 * Build the request URL.
 *
 * Mock mode uses the nested path under `/api`. Live mode (Supabase Edge
 * Functions) appends the contract path to the functions base, where the FIRST
 * path segment is the function name. Most paths map directly (`/trips`,
 * `/trips/:id/plan/chat`); the three whose contract path has multiple leading
 * segments are deployed as a single hyphenated function name, so they pass an
 * explicit `livePath` (e.g. mock `/demo/generate-day` -> live `/demo-generate-day`).
 */
export function endpointUrl(path: string, served: boolean, livePath?: string): string {
  if (served && hasLiveApi()) {
    return `${env.apiBase.replace(/\/$/, "")}${livePath ?? path}`;
  }
  return `/api${path}`;
}

/**
 * Whether a request to this endpoint hits the live BE (vs the in-repo mock).
 */
export function isLiveCall(served: boolean): boolean {
  return served && hasLiveApi();
}

/**
 * Fetch through the hybrid router. For live calls to the Supabase Edge Functions
 * BE, attach the Supabase `apikey` + `Authorization` headers (the gateway
 * requires them). `accessToken` is the signed-in user's JWT when available;
 * otherwise the anon key is used (fine for public endpoints like demo/signup).
 * Mock calls are unchanged, so CI / mock mode is unaffected.
 */
export async function apiFetch(
  path: string,
  served: boolean,
  init?: RequestInit & { accessToken?: string | null; livePath?: string },
): Promise<Response> {
  const url = endpointUrl(path, served, init?.livePath);
  const headers = new Headers(init?.headers);

  if (isLiveCall(served) && env.supabaseAnonKey) {
    headers.set("apikey", env.supabaseAnonKey);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${init?.accessToken || env.supabaseAnonKey}`);
    }
  }

  const { accessToken: _t, livePath: _lp, ...rest } = init ?? {};
  return fetch(url, { ...rest, headers });
}

/** Endpoints the live contract serves today (CONTRACT-STATUS v0.8). */
export const SERVED = {
  demoGenerateDay: true,
  signupCapture: true,
  listTrips: true,
  createTrip: true,
  getTrip: true,
  content: true,
  auth2fa: true,
  planChat: true,
  // Live; the FE consumes the contract DTOs (per-trip surfaces migrated wholesale):
  profiles: true,
  checkout: true,
  packing: true,
  progress: true,
  stars: true,
  grownups: true,
  ingest: true,
  connectors: true,
  // Parent/carer PIN set/verify (`POST /profiles/:id/pin[/verify]`) - the user-types
  // model is live as of contract @0.15 (PinRequest/PinVerifyResponse).
  profilesPin: true,
  // Journal - live as of contract @0.15: JournalEntry/JournalEntryInput carry
  // day_id, mood and stars, so the day-scoped FE journal maps wholesale.
  journal: true,
  // Account summary (`GET /account`) - live as of contract @0.18 (AccountSummary
  // carries email, secondary_email, tier, role, two_factor_enrolled, ...).
  account: true,
  // Media sign-upload (`POST /media/sign-upload` -> live fn `media-sign-upload`);
  // journal reads resolve media_ref ids to signed URLs. Live as of contract @0.18.
  media: true,
  // During-trip companion cards (`GET /trips/:id/companion`) and the reopenable
  // planning chat history (`GET /trips/:id/chat`). Live as of contract @0.21/0.22.
  companion: true,
  chatHistory: true,
  // Billing/transaction history (`GET /account/transactions`). Live as of contract
  // @0.31 - Stripe-sourced from the purchases table, each line carries trip_id.
  transactions: true,
  // Pricing catalogue (Stripe-sourced amounts). No /catalogue endpoint yet -
  // mock-backed until BE ships it. See docs/handoffs.
  catalogue: false,
  // Per-explorer feature toggles (`GET|PUT /trips/:id/features`) - live as of
  // BE migration 0031. Reads degrade to "no overrides" if not yet deployed.
  features: true,
  // Trip management: archive/unarchive, duplicate, share-by-link/email, the public
  // read-only shared view, and recipient duplicate-from-share. Live as of contract
  // @0.31. See docs/handoffs/13.
  archiveTrip: true,
  duplicateTrip: true,
  shareTrip: true,
  sharedTrip: true,
  // Trip economics layer (per-child challenges, cash budget, itemised costs, star
  // rewards). Live: BE ships these (migration 0036 + /trips/:id/{challenges,budget,
  // costs,rewards}). Mock routes remain as the offline/no-API-base fallback.
  challenges: true,
  budget: true,
  costs: true,
  rewards: true,
  // Per-trip membership roster (`GET|POST /trips/:id/members`,
  // `DELETE /trips/:id/members/:profileId`). Live as of BE migration 0037; the
  // mock routes remain as the offline / no-API-base fallback.
  members: true,
} as const;
