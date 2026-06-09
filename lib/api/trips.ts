import { env, hasLiveApi } from "@/lib/env";
import type {
  ChildProfile,
  TripContent,
  TripSummary,
} from "@/lib/contract-mock/types";

function apiUrl(path: string): string {
  // Live BE serves these paths directly; the in-repo mock prefixes /api.
  return hasLiveApi() ? `${env.apiBase.replace(/\/$/, "")}${path}` : `/api${path}`;
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(apiUrl(path), { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
  return (await res.json()) as T;
}

export async function listTrips(signal?: AbortSignal): Promise<TripSummary[]> {
  const data = await getJson<{ trips: TripSummary[] }>("/trips", signal);
  return data.trips;
}

export async function getTrip(id: string, signal?: AbortSignal): Promise<TripContent> {
  return getJson<TripContent>(`/trips/${id}`, signal);
}

export async function listProfiles(signal?: AbortSignal): Promise<ChildProfile[]> {
  const data = await getJson<{ profiles: ChildProfile[] }>("/profiles", signal);
  return data.profiles;
}
