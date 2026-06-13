import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  StarClaimRequest,
  StarClaimResponse,
  StarsResponse,
} from "@/lib/contract-mock/types";

/**
 * The whole trip's star ledger (`{ balances, entries }`). The contract returns
 * every child's row; the FE selects a child with the `lib/stars` helpers.
 * `profileId` is kept on the signature only to scope the react-query cache key.
 */
export async function getStars(
  tripId: string,
  _profileId: string,
  signal?: AbortSignal,
): Promise<StarsResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/stars`, SERVED.stars, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load stars (${res.status})`);
  return (await res.json()) as StarsResponse;
}

export async function claimStar(
  tripId: string,
  req: StarClaimRequest,
): Promise<StarClaimResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/stars/claim`, SERVED.stars, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to claim star (${res.status})`);
  return (await res.json()) as StarClaimResponse;
}
