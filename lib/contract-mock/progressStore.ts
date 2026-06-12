/**
 * MOCK per-profile progress store - TEMPORARY. Stands in for the BE
 * `trip_progress` table until the live API exists. Keyed by trip + profile;
 * the done set holds stable activity ids (never label text). Module memory, so
 * it resets on server restart. Swap target: BE `GET|PATCH /trips/:id/progress`.
 */
import type { ProgressState } from "./types";

const store = new Map<string, Set<string>>();

function key(tripId: string, profileId: string): string {
  return `${tripId}::${profileId}`;
}

export function getProgress(tripId: string, profileId: string): ProgressState {
  return { trip_id: tripId, profile_id: profileId, done: [...(store.get(key(tripId, profileId)) ?? [])] };
}

export function setActivityDone(
  tripId: string,
  profileId: string,
  activityId: string,
  done: boolean,
): ProgressState {
  const k = key(tripId, profileId);
  const set = store.get(k) ?? new Set<string>();
  if (done) set.add(activityId);
  else set.delete(activityId);
  store.set(k, set);
  return { trip_id: tripId, profile_id: profileId, done: [...set] };
}
