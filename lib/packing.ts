import type { PackingList } from "@/lib/contract-mock/types";

/** Pure packing counts for the progress strips. */
export interface PackCount {
  packed: number;
  total: number;
  pct: number;
}

export function listCount(list: PackingList): PackCount {
  const items = list.sections.flatMap((s) => s.items);
  const total = items.length;
  const packed = items.filter((i) => i.checked).length;
  return { packed, total, pct: total === 0 ? 0 : Math.round((packed / total) * 100) };
}

export function allPacked(list: PackingList): boolean {
  const c = listCount(list);
  return c.total > 0 && c.packed === c.total;
}
