import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  JournalEntryLocal,
  JournalEntryLocalInput,
} from "@/lib/contract-mock/types";

export async function listJournal(
  tripId: string,
  profileId?: string,
  signal?: AbortSignal,
): Promise<JournalEntryLocal[]> {
  const qs = profileId ? `?profile_id=${encodeURIComponent(profileId)}` : "";
  // Deferred on BE - stays on the mock until the journal handler ships.
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/journal${qs}`, SERVED.journal, {
    signal,
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to load journal (${res.status})`);
  const data = (await res.json()) as { entries: JournalEntryLocal[] };
  return data.entries;
}

export async function addJournalEntry(
  input: JournalEntryLocalInput,
): Promise<JournalEntryLocal> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${input.trip_id}/journal`, SERVED.journal, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to save entry (${res.status})`);
  return (await res.json()) as JournalEntryLocal;
}
