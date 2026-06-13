import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  ChecklistItem,
  ChecklistResponse,
  ChecklistUpdateRequest,
} from "@/lib/contract-mock/types";

export async function getChecklist(
  tripId: string,
  signal?: AbortSignal,
): Promise<ChecklistItem[]> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/grownups/checklist`, SERVED.grownups, {
    signal,
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to load checklist (${res.status})`);
  return ((await res.json()) as ChecklistResponse).items;
}

export async function setChecklistItem(
  tripId: string,
  item: string,
  checked: boolean,
): Promise<ChecklistItem[]> {
  const accessToken = await getAccessToken();
  const body: ChecklistUpdateRequest = { item, checked };
  const res = await apiFetch(`/trips/${tripId}/grownups/checklist`, SERVED.grownups, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to update checklist (${res.status})`);
  return ((await res.json()) as ChecklistResponse).items;
}
