import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { IngestRequest, IngestResponse } from "@alkazat/contracts";

/**
 * Ingest a photo/receipt/booking (or pasted text) into a trip's content
 * (`POST /trips/:id/ingest`, paid tiers). BE runs the vision/AI harness, applies
 * the resulting patch, and returns the updated content + the patch it made.
 */
export async function ingest(tripId: string, req: IngestRequest): Promise<IngestResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/ingest`, SERVED.ingest, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to ingest (${res.status})`);
  return (await res.json()) as IngestResponse;
}
