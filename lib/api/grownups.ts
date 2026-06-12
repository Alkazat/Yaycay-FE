import { endpointUrl, SERVED } from "@/lib/api/http";
import type { ChecklistItem } from "@/lib/contract-mock/types";

export async function getChecklist(
  tripId: string,
  signal?: AbortSignal,
): Promise<ChecklistItem[]> {
  const res = await fetch(endpointUrl(`/trips/${tripId}/grownups/checklist`, SERVED.grownups), {
    signal,
  });
  if (!res.ok) throw new Error(`Failed to load checklist (${res.status})`);
  return ((await res.json()) as { items: ChecklistItem[] }).items;
}

export async function setChecklistItem(
  tripId: string,
  itemId: string,
  done: boolean,
): Promise<ChecklistItem[]> {
  const res = await fetch(endpointUrl(`/trips/${tripId}/grownups/checklist`, SERVED.grownups), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ item_id: itemId, done }),
  });
  if (!res.ok) throw new Error(`Failed to update checklist (${res.status})`);
  return ((await res.json()) as { items: ChecklistItem[] }).items;
}
