import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { RewardsResponse } from "@/lib/contract-mock/types";

/**
 * Star-to-cash reward configs for a trip (`GET /trips/:id/rewards`).
 * Each row maps a profile (or trip-wide when profile_id is null) to a
 * star target and cash payout.
 */
export async function getTripRewards(
  tripId: string,
  signal?: AbortSignal,
): Promise<RewardsResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/rewards`, SERVED.rewards, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load rewards (${res.status})`);
  return (await res.json()) as RewardsResponse;
}
