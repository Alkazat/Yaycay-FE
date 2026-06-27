import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { BudgetResponse } from "@/lib/contract-mock/types";

/**
 * Cash budget and exchange rate for a trip (`GET /trips/:id/budget`).
 * Returns `{ budget: null }` when the trip has no budget configured yet.
 */
export async function getTripBudget(tripId: string, signal?: AbortSignal): Promise<BudgetResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/budget`, SERVED.budget, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load budget (${res.status})`);
  return (await res.json()) as BudgetResponse;
}
