import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { CostsResponse } from "@/lib/contract-mock/types";

/**
 * Itemised cost lines for a trip (`GET /trips/:id/costs`).
 * Each line carries a day, node_ref, amount, and paid flag.
 */
export async function getTripCosts(tripId: string, signal?: AbortSignal): Promise<CostsResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/costs`, SERVED.costs, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load costs (${res.status})`);
  return (await res.json()) as CostsResponse;
}
