import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { StarsState, StarClaimRequest } from "@/lib/contract-mock/types";

export async function getStars(
  tripId: string,
  profileId: string,
  signal?: AbortSignal,
): Promise<StarsState> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(
    `/trips/${tripId}/stars?profile_id=${encodeURIComponent(profileId)}`,
    SERVED.stars,
    { signal, accessToken },
  );
  if (!res.ok) throw new Error(`Failed to load stars (${res.status})`);
  return (await res.json()) as StarsState;
}

export async function claimStar(
  tripId: string,
  req: StarClaimRequest,
): Promise<StarsState> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/stars/claim`, SERVED.stars, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to claim star (${res.status})`);
  return (await res.json()) as StarsState;
}
