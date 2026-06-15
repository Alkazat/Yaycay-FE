import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { FeatureOverrides } from "@/lib/features";
import type { TripFeaturesResponse } from "@/lib/contract-mock/types";

/**
 * Per-explorer feature toggles, keyed by profile id. These are the parent's
 * OVERRIDES on top of each explorer's age-band defaults (resolved by
 * `lib/features`); the BE stores only the sparse map.
 *
 * Reads degrade gracefully: a 404 (no trip, or the endpoint not deployed yet)
 * reads as "no overrides", so the Exploring UI falls back to the band presets
 * rather than erroring.
 */
export async function getFeatures(
  tripId: string,
  signal?: AbortSignal,
): Promise<Record<string, FeatureOverrides>> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/features`, SERVED.features, { signal, accessToken });
  if (res.status === 404) return {};
  if (!res.ok) throw new Error(`Failed to load features (${res.status})`);
  const data = (await res.json()) as TripFeaturesResponse;
  const out: Record<string, FeatureOverrides> = {};
  for (const row of data.features ?? []) out[row.profile_id] = row.overrides ?? {};
  return out;
}

/** Replace one explorer's overrides (an empty map resets them to the defaults). */
export async function putFeatures(
  tripId: string,
  profileId: string,
  overrides: FeatureOverrides,
): Promise<void> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/features`, SERVED.features, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profile_id: profileId, overrides }),
    accessToken,
  });
  if (!res.ok && res.status !== 404) throw new Error(`Failed to save features (${res.status})`);
}
