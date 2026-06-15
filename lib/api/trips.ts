import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  ChildProfile,
  CreateTripRequest,
  Trip,
  TripContent,
  TripContentPatch,
  TripSummary,
} from "@/lib/contract-mock/types";

async function getJson<T>(path: string, served: boolean, signal?: AbortSignal): Promise<T> {
  // Trips are authenticated; carry the signed-in user's JWT when available.
  const accessToken = await getAccessToken();
  const res = await apiFetch(path, served, { signal, accessToken });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
  return (await res.json()) as T;
}

export async function listTrips(signal?: AbortSignal): Promise<TripSummary[]> {
  const data = await getJson<{ trips: TripSummary[] }>("/trips", SERVED.listTrips, signal);
  return data.trips;
}

/**
 * Create a trip (`POST /trips`). A new trip starts free + single-day; expanding
 * to the full multi-day experience is a paid upgrade (paywall).
 */
export async function createTrip(req: CreateTripRequest): Promise<Trip> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/trips", SERVED.createTrip, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to create trip (${res.status})`);
  return (await res.json()) as Trip;
}

/** The trip record (row): status, tier, dates, retention. NOT the day content. */
export async function getTrip(id: string, signal?: AbortSignal): Promise<Trip> {
  return getJson<Trip>(`/trips/${id}`, SERVED.getTrip, signal);
}

/** The full day-by-day content (`GET /trips/:id/content`). */
export async function getTripContent(id: string, signal?: AbortSignal): Promise<TripContent> {
  return getJson<TripContent>(`/trips/${id}/content`, SERVED.content, signal);
}

/** Apply a structured patch to the trip content (`PATCH /trips/:id/content`). */
export async function patchTripContent(
  id: string,
  patch: TripContentPatch,
): Promise<TripContent> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${id}/content`, SERVED.content, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to update trip content (${res.status})`);
  return (await res.json()) as TripContent;
}

export async function listProfiles(signal?: AbortSignal): Promise<ChildProfile[]> {
  const data = await getJson<{ profiles: ChildProfile[] }>("/profiles", SERVED.profiles, signal);
  return data.profiles;
}
