import { env, hasLiveApi } from "@/lib/env";

/**
 * Per-endpoint routing for the hybrid period.
 *
 * Per Yaycay-BE `CONTRACT-STATUS.md` (v0.4), only some endpoints are actually
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

/** Endpoints the live contract serves today (CONTRACT-STATUS v0.4). */
export const SERVED = {
  demoGenerateDay: true,
  signupCapture: true,
  listTrips: true,
  getTrip: true,
  auth2fa: true,
  planChat: true,
  // Deferred on BE - keep on the mock until their handler ships:
  profiles: false,
  account: false,
  journal: false,
  checkout: false,
  progress: false,
  stars: false,
  packing: false,
  grownups: false,
  media: false,
} as const;
