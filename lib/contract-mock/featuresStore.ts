/**
 * MOCK per-explorer feature toggles - TEMPORARY. Stands in for the BE
 * `trip_profile_features` table until live mode is on. Keyed by trip + profile;
 * stores the sparse overrides map. Module memory, so it resets on restart.
 * Swap target: BE `GET|PUT /trips/:id/features`.
 */
import type { TripFeatureRow } from "./types";

const store = new Map<string, Record<string, boolean>>();

function key(tripId: string, profileId: string): string {
  return `${tripId}::${profileId}`;
}

export function listFeatures(tripId: string): TripFeatureRow[] {
  const rows: TripFeatureRow[] = [];
  for (const [k, overrides] of store) {
    const [t, profileId] = k.split("::");
    if (t === tripId) rows.push({ profile_id: profileId, overrides });
  }
  return rows;
}

export function putFeatures(
  tripId: string,
  profileId: string,
  overrides: Record<string, boolean>,
): TripFeatureRow {
  store.set(key(tripId, profileId), overrides);
  return { profile_id: profileId, overrides, updated_at: new Date().toISOString() };
}
