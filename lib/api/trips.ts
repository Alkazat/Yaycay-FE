import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  ChildProfile,
  TripContent,
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

export async function getTrip(id: string, signal?: AbortSignal): Promise<TripContent> {
  return getJson<TripContent>(`/trips/${id}`, SERVED.getTrip, signal);
}

export async function listProfiles(signal?: AbortSignal): Promise<ChildProfile[]> {
  // Deferred on BE - stays on the mock until GET /profiles ships.
  const data = await getJson<{ profiles: ChildProfile[] }>("/profiles", SERVED.profiles, signal);
  return data.profiles;
}
