import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { ChallengesResponse } from "@/lib/contract-mock/types";

/**
 * Per-child challenges for a trip day/node (`GET /trips/:id/challenges`).
 * Pass `profileId` to scope results to a single child; omit for all profiles.
 */
export async function getTripChallenges(
  tripId: string,
  profileId?: string,
  signal?: AbortSignal,
): Promise<ChallengesResponse> {
  const accessToken = await getAccessToken();
  const path = profileId
    ? `/trips/${tripId}/challenges?profile=${profileId}`
    : `/trips/${tripId}/challenges`;
  const res = await apiFetch(path, SERVED.challenges, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load challenges (${res.status})`);
  return (await res.json()) as ChallengesResponse;
}
