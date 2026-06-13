/**
 * MOCK per-profile progress store - TEMPORARY. Stands in for the BE
 * `trip_progress` table until the live API exists. Keyed by trip + profile;
 * the done set holds stable activity ids (never label text). Module memory, so
 * it resets on server restart. Swap target: BE `GET|PATCH /trips/:id/progress`.
 */
import type { ExplorerMode, TripProgress } from "./types";

interface Row {
  done: Set<string>;
  active_mode?: ExplorerMode | null;
  updated_at: string;
}

const store = new Map<string, Row>();

function key(tripId: string, profileId: string): string {
  return `${tripId}::${profileId}`;
}

function row(tripId: string, profileId: string): Row {
  const k = key(tripId, profileId);
  if (!store.has(k)) store.set(k, { done: new Set(), updated_at: new Date(0).toISOString() });
  return store.get(k)!;
}

function toDto(profileId: string, r: Row): TripProgress {
  return {
    profile_id: profileId,
    active_mode: r.active_mode ?? null,
    done_items: [...r.done],
    updated_at: r.updated_at,
  };
}

export function getProgress(tripId: string, profileId: string): TripProgress {
  return toDto(profileId, row(tripId, profileId));
}

/**
 * Apply a contract-shaped progress update: a full `done_items` replacement
 * and/or incremental `mark_done` / `mark_undone`, plus an optional mode change.
 */
export function updateProgress(
  tripId: string,
  profileId: string,
  patch: {
    active_mode?: ExplorerMode;
    done_items?: string[];
    mark_done?: string[];
    mark_undone?: string[];
  },
): TripProgress {
  const r = row(tripId, profileId);
  if (patch.done_items) r.done = new Set(patch.done_items);
  for (const id of patch.mark_done ?? []) r.done.add(id);
  for (const id of patch.mark_undone ?? []) r.done.delete(id);
  if (patch.active_mode !== undefined) r.active_mode = patch.active_mode;
  r.updated_at = new Date().toISOString();
  return toDto(profileId, r);
}
