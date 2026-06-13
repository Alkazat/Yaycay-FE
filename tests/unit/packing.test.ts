import { describe, it, expect } from "vitest";
import { listCount, allPacked } from "@/lib/packing";
import type { PackingList } from "@/lib/contract-mock/types";

const list: PackingList = {
  id: "p1",
  label: "Savy",
  sections: [
    {
      id: "s1",
      label: "Clothes",
      items: [
        { id: "i1", label: "Hat", checked: true },
        { id: "i2", label: "Shoes", checked: false },
      ],
    },
    { id: "s2", label: "Tech", items: [{ id: "i3", label: "Charger", checked: true }] },
  ],
};

describe("packing counts", () => {
  it("counts packed vs total across sections", () => {
    expect(listCount(list)).toEqual({ packed: 2, total: 3, pct: 67 });
  });

  it("allPacked is false unless every item is checked", () => {
    expect(allPacked(list)).toBe(false);
    const full: PackingList = {
      ...list,
      sections: list.sections.map((s) => ({ ...s, items: s.items.map((i) => ({ ...i, checked: true })) })),
    };
    expect(allPacked(full)).toBe(true);
  });

  it("an empty list is never all packed", () => {
    expect(allPacked({ id: "x", label: "x", sections: [] })).toBe(false);
  });
});
