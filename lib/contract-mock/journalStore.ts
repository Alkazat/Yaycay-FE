/**
 * MOCK in-memory journal store - TEMPORARY. Stands in for the BE
 * `journal_entries` table in mock/CI mode (the live contract serves journal as
 * of @0.15). State lives in module memory, so it persists for the life of the
 * server process and resets on restart.
 */
import type { JournalEntry, JournalEntryInput } from "./types";
import { clampStars } from "@/lib/journal";

const entries: JournalEntry[] = [
  {
    id: "j_seed_1",
    trip_id: "t_sg",
    profile_id: "p_tay",
    day_id: "d_2",
    body: "The Cloud Forest waterfall was HUGE. Best day.",
    stars: 5,
    media_ref: [],
    created_at: "2026-06-27T12:30:00Z",
  },
];

export function listJournal(tripId: string, profileId?: string): JournalEntry[] {
  return entries
    .filter((e) => e.trip_id === tripId && (!profileId || e.profile_id === profileId))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function addJournal(tripId: string, input: JournalEntryInput): JournalEntry {
  const entry: JournalEntry = {
    id: `j_${Math.random().toString(36).slice(2, 10)}`,
    trip_id: tripId,
    profile_id: input.profile_id ?? null,
    day_id: input.day_id ?? null,
    body: input.body?.trim() ?? "",
    stars: input.stars == null ? null : clampStars(input.stars),
    mood: input.mood || null,
    media_ref: input.media_ref ?? [],
    created_at: new Date().toISOString(),
  };
  entries.push(entry);
  return entry;
}
