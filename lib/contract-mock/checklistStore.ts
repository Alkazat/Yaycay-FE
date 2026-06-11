/**
 * MOCK grown-ups booking checklist - TEMPORARY. Persisted ticks (the prototype's
 * checklist did not persist; this one does). Module memory; resets on restart.
 * Swap target: BE `GET|PATCH /trips/:id/grownups/checklist`.
 */
import type { ChecklistItem } from "./types";

const SEED: Omit<ChecklistItem, "done">[] = [
  { id: "c1", group: "Do this week", label: "Book Universal Studios Express Pass" },
  { id: "c2", group: "Do this week", label: "Confirm Adventure Cove cabana" },
  { id: "c3", group: "Book soon", label: "Reserve Tanjong Beach Club dinner (table of 5)" },
  { id: "c4", group: "Book soon", label: "Buy Gardens by the Bay tickets" },
  { id: "c5", group: "Confirm & admin", label: "Print allergy cards (English + Mandarin)" },
  { id: "c6", group: "Confirm & admin", label: "Check all 5 passports have 6 months validity" },
];

const store = new Map<string, ChecklistItem[]>();

export function getChecklist(tripId: string): ChecklistItem[] {
  if (!store.has(tripId)) {
    store.set(tripId, SEED.map((s) => ({ ...s, done: false })));
  }
  return store.get(tripId)!;
}

export function setChecklistItem(tripId: string, itemId: string, done: boolean): ChecklistItem[] {
  const items = getChecklist(tripId).map((i) => (i.id === itemId ? { ...i, done } : i));
  store.set(tripId, items);
  return items;
}
