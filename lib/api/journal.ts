import { env, hasLiveApi } from "@/lib/env";
import type { JournalEntry, JournalEntryInput } from "@/lib/contract-mock/types";

function apiUrl(path: string): string {
  return hasLiveApi() ? `${env.apiBase.replace(/\/$/, "")}${path}` : `/api${path}`;
}

export async function listJournal(
  tripId: string,
  profileId?: string,
  signal?: AbortSignal,
): Promise<JournalEntry[]> {
  const qs = profileId ? `?profile_id=${encodeURIComponent(profileId)}` : "";
  const res = await fetch(apiUrl(`/trips/${tripId}/journal${qs}`), { signal });
  if (!res.ok) throw new Error(`Failed to load journal (${res.status})`);
  const data = (await res.json()) as { entries: JournalEntry[] };
  return data.entries;
}

export async function addJournalEntry(input: JournalEntryInput): Promise<JournalEntry> {
  const res = await fetch(apiUrl(`/trips/${input.trip_id}/journal`), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to save entry (${res.status})`);
  return (await res.json()) as JournalEntry;
}
