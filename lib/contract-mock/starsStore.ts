/**
 * MOCK star ledger - TEMPORARY. Stands in for the BE `star_ledger` until the
 * live API exists. Claims are idempotent per profile per day per source. Module
 * memory; resets on restart. Swap target: BE `/trips/:id/stars` endpoints.
 */
import type { StarsState, StarSource } from "./types";
import { claimKey } from "@/lib/stars";

const store = new Map<string, StarsState>();

function key(tripId: string, profileId: string): string {
  return `${tripId}::${profileId}`;
}

export function getStars(tripId: string, profileId: string): StarsState {
  return (
    store.get(key(tripId, profileId)) ?? {
      trip_id: tripId,
      profile_id: profileId,
      stars: 0,
      claims: [],
    }
  );
}

export function claimStar(
  tripId: string,
  profileId: string,
  dayId: string,
  source: StarSource,
): StarsState {
  const state = getStars(tripId, profileId);
  const ck = claimKey(dayId, source);
  if (!state.claims.includes(ck)) {
    state.claims = [...state.claims, ck];
    state.stars += 1;
  }
  store.set(key(tripId, profileId), state);
  return state;
}
