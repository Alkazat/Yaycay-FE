import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { CompanionCard, CompanionResponse } from "@/lib/contract-mock/types";

/**
 * The trip's pre-loaded "what's nearby" companion cards (`GET /trips/:id/companion`).
 * Each card carries nearby options with allergy text flags + a one-tap rain plan,
 * so the during-trip surface needs no live model call.
 */
export async function getCompanion(
  tripId: string,
  signal?: AbortSignal,
): Promise<CompanionCard[]> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/companion`, SERVED.companion, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load companion (${res.status})`);
  return ((await res.json()) as CompanionResponse).cards;
}
