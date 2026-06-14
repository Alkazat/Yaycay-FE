import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  JournalEntry,
  JournalEntryInput,
  JournalListResponse,
} from "@/lib/contract-mock/types";

/** List journal entries for a trip (`GET /trips/:id/journal`). */
export async function listJournal(
  tripId: string,
  profileId?: string,
  signal?: AbortSignal,
): Promise<JournalEntry[]> {
  const qs = profileId ? `?profile_id=${encodeURIComponent(profileId)}` : "";
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/journal${qs}`, SERVED.journal, {
    signal,
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to load journal (${res.status})`);
  const data = (await res.json()) as JournalListResponse;
  return data.entries;
}

/** Add a journal entry (`POST /trips/:id/journal`). `trip_id` is the path param. */
export async function addJournalEntry(
  tripId: string,
  input: JournalEntryInput,
): Promise<JournalEntry> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/journal`, SERVED.journal, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to save entry (${res.status})`);
  return (await res.json()) as JournalEntry;
}
