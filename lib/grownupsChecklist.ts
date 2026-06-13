import type { ChecklistItem } from "@/lib/contract-mock/types";

/**
 * The grown-ups booking checklist. The live contract persists only ticks,
 * keyed by a stable `item` string (`{ item, checked, updated_at }`); the labels
 * are seeded from the trip content's `grownups.checklist`. So the FE derives a
 * stable key per label and overlays the persisted ticks onto it.
 */
export function checklistKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface ChecklistRow {
  /** Stable contract key for this row's tick. */
  item: string;
  label: string;
  checked: boolean;
}

/** Merge seed labels with persisted ticks into render rows. */
export function mergeChecklist(
  labels: string[],
  persisted: ChecklistItem[] | undefined,
): ChecklistRow[] {
  const ticks = new Map((persisted ?? []).map((i) => [i.item, i.checked]));
  return labels.map((label) => {
    const item = checklistKey(label);
    return { item, label, checked: ticks.get(item) ?? false };
  });
}
