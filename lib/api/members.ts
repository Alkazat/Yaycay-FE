import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { TripMembersResponse } from "@/lib/contract-mock/types";

/**
 * Per-trip roster (`GET /trips/:id/members`).
 * Returns only the profiles on this specific trip's roster.
 * Mirror of the challenges/budget/costs/rewards pattern.
 */
export async function getTripMembers(
  tripId: string,
  signal?: AbortSignal,
): Promise<TripMembersResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/members`, SERVED.members, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load trip members (${res.status})`);
  return (await res.json()) as TripMembersResponse;
}

/**
 * Add a profile to a trip's roster (`POST /trips/:id/members`).
 * Returns 201 on a fresh add, 200 if the profile is already a member.
 */
export async function addTripMember(
  tripId: string,
  profileId: string,
): Promise<TripMembersResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/members`, SERVED.members, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profile_id: profileId }),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to add trip member (${res.status})`);
  return (await res.json()) as TripMembersResponse;
}

/**
 * Remove a profile from a trip's roster (`DELETE /trips/:id/members/:profileId`).
 * Returns 204 No Content on success.
 */
export async function removeTripMember(tripId: string, profileId: string): Promise<void> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/members/${profileId}`, SERVED.members, {
    method: "DELETE",
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to remove trip member (${res.status})`);
}
