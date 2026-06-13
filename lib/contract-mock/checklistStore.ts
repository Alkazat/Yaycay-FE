/**
 * MOCK grown-ups booking checklist - TEMPORARY. Persists only ticks, keyed by a
 * stable `item` string, exactly like the contract (`{ item, checked,
 * updated_at }`). Labels live in the trip content seed, not here. Module memory;
 * resets on restart. Swap target: BE `GET|PATCH /trips/:id/grownups/checklist`.
 */
import type { ChecklistItem } from "./types";

const store = new Map<string, Map<string, ChecklistItem>>();

function ticks(tripId: string): Map<string, ChecklistItem> {
  if (!store.has(tripId)) store.set(tripId, new Map());
  return store.get(tripId)!;
}

export function getChecklist(tripId: string): ChecklistItem[] {
  return [...ticks(tripId).values()];
}

export function setChecklistItem(tripId: string, item: string, checked: boolean): ChecklistItem[] {
  ticks(tripId).set(item, { item, checked, updated_at: new Date().toISOString() });
  return getChecklist(tripId);
}
