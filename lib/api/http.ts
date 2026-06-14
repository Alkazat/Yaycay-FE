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
  // Deferred on the mock:
  //  - profilesPin: guardian PIN set/verify (`POST /profiles/:id/pin[/verify]`).
  //    User-types model targets contract @0.13; mock-served until published.
  profilesPin: false,
  //  - journal: contract `JournalEntry` has no `day_id`, but the FE journal is
  //    day-scoped (picker, per-day badges, keepsake). Stays mock pending a BE
  //    contract field. See lib/contract-mock/journalStore.ts.
  //  - account / media: no contract handler adopted yet.
  account: false,
  journal: false,
  media: false,
} as const;
