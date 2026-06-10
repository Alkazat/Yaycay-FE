import { endpointUrl, SERVED } from "@/lib/api/http";
import type { JournalEntry, JournalEntryInput } from "@/lib/contract-mock/types";

export async function listJournal(
  tripId: string,
  profileId?: string,
  signal?: AbortSignal,
): Promise<JournalEntry[]> {
  const qs = profileId ? `?profile_id=${encodeURIComponent(profileId)}` : "";
  // Deferred on BE - stays on the mock until the journal handler ships.
  const res = await fetch(endpointUrl(`/trips/${tripId}/journal${qs}`, SERVED.journal), {
    signal,
  });
  if (!res.ok) throw new Error(`Failed to load journal (${res.status})`);
  const data = (await res.json()) as { entries: JournalEntry[] };
  return data.entries;
}

export async function addJournalEntry(input: JournalEntryInput): Promise<JournalEntry> {
  const res = await fetch(endpointUrl(`/trips/${input.trip_id}/journal`, SERVED.journal), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to save entry (${res.status})`);
  return (await res.json()) as JournalEntry;
}
