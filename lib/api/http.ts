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
export function endpointUrl(path: string, served: boolean): string {
  if (served && hasLiveApi()) {
    return `${env.apiBase.replace(/\/$/, "")}${path}`;
  }
  return `/api${path}`;
}

/** Endpoints the live contract serves today (CONTRACT-STATUS v0.4). */
export const SERVED = {
  demoGenerateDay: true,
  signupCapture: true,
  listTrips: true,
  getTrip: true,
  // Deferred on BE - keep on the mock until their handler ships:
  profiles: false,
  account: false,
  journal: false,
  checkout: false,
} as const;
