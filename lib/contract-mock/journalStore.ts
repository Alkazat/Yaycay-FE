/**
 * MOCK in-memory journal store - TEMPORARY. Stands in for the BE
 * `journal_entries` table until the live API exists. State lives in module
 * memory, so it persists for the life of the server process (fine for local
 * dev / a single `next start`) and resets on restart. Swap target: BE journal
 * endpoints. See ./README.md.
 */
import type { JournalEntry, JournalEntryInput } from "./types";
import { clampStars } from "@/lib/journal";

const entries: JournalEntry[] = [
  {
    id: "j_seed_1",
    trip_id: "t_sg",
    profile_id: "p_mara",
    day_id: "d_2",
    note: "The Cloud Forest waterfall was HUGE. Best day.",
    stars: 5,
    created_at: "2026-06-27T12:30:00Z",
  },
];

export function listJournal(tripId: string, profileId?: string): JournalEntry[] {
  return entries
    .filter((e) => e.trip_id === tripId && (!profileId || e.profile_id === profileId))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function addJournal(input: JournalEntryInput): JournalEntry {
  const entry: JournalEntry = {
    id: `j_${Math.random().toString(36).slice(2, 10)}`,
    trip_id: input.trip_id,
    profile_id: input.profile_id,
    day_id: input.day_id,
    note: input.note?.trim() || undefined,
    stars: input.stars == null ? undefined : clampStars(input.stars),
    created_at: new Date().toISOString(),
  };
  entries.push(entry);
  return entry;
}
