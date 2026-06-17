import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  ChildProfile,
  CreateTripRequest,
  SharedTrip,
  ShareTripResponse,
  Trip,
  TripContent,
  TripContentPatch,
  TripSummary,
} from "@/lib/contract-mock/types";

export type { SharedTrip, ShareTripResponse };

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

async function postJson<T>(path: string, served: boolean, body: unknown): Promise<T> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(path, served, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
    accessToken,
  });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
  return (await res.json()) as T;
}

/** Archive or restore a trip (`POST /trips/:id/archive`). Returns the updated row. */
export async function archiveTrip(id: string, archived: boolean): Promise<Trip> {
  return postJson<Trip>(`/trips/${id}/archive`, SERVED.archiveTrip, { archived });
}

/**
 * Duplicate a trip into a fresh draft the caller owns (`POST /trips/:id/duplicate`).
 * The copy starts free + editable; upgrading to a full holiday is the usual paywall.
 */
export async function duplicateTrip(id: string): Promise<Trip> {
  return postJson<Trip>(`/trips/${id}/duplicate`, SERVED.duplicateTrip, {});
}

/**
 * Share a trip read-only (`POST /trips/:id/share`). Returns a public link; if an
 * email is given, BE also sends the recipient an invite. Recipients view read-only
 * and can duplicate into their own (paid) trip.
 */
export async function shareTrip(id: string, email?: string): Promise<ShareTripResponse> {
  return postJson<ShareTripResponse>(`/trips/${id}/share`, SERVED.shareTrip, {
    email: email?.trim() || undefined,
  });
}

/** Resolve a share token to its read-only trip (`GET /shared/:token`). Public. */
export async function getSharedTrip(token: string, signal?: AbortSignal): Promise<SharedTrip> {
  const res = await apiFetch(`/shared/${encodeURIComponent(token)}`, SERVED.sharedTrip, { signal });
  if (!res.ok) throw new Error(`Shared trip not found (${res.status})`);
  return (await res.json()) as SharedTrip;
}

/**
 * Recipient duplicates a shared trip into their own account
 * (`POST /shared/:token/duplicate`). Requires the recipient's JWT. Returns the
 * new trip (fresh, free, editable) - the "Plan my own version" action.
 */
export async function duplicateSharedTrip(token: string): Promise<Trip> {
  return postJson<Trip>(`/shared/${encodeURIComponent(token)}/duplicate`, SERVED.sharedTrip, {});
}
