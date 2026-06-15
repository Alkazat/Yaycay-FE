import { describe, it, expect } from "vitest";
import { addDayOp, addMomentOp, setDaySummaryOp, newId, MOMENT_SLOTS } from "@/lib/planOps";

describe("planOps builders", () => {
  it("addDayOp builds a well-formed, empty day", () => {
    const op = addDayOp("Day 3", "2026-07-01");
    expect(op.op).toBe("add_day");
    if (op.op === "add_day") {
      expect(op.day.label).toBe("Day 3");
      expect(op.day.date).toBe("2026-07-01");
      expect(op.day.moments).toEqual([]);
      expect(op.day.id).toMatch(/^day_/);
    }
  });

  it("addDayOp defaults the date to empty when omitted", () => {
    const op = addDayOp("Bonus day");
    if (op.op === "add_day") expect(op.day.date).toBe("");
  });

  it("addMomentOp targets a day and builds an empty moment", () => {
    const op = addMomentOp("day_1", "afternoon", "Beach time");
    expect(op.op).toBe("add_moment");
    if (op.op === "add_moment") {
      expect(op.day_id).toBe("day_1");
      expect(op.moment.slot).toBe("afternoon");
      expect(op.moment.title).toBe("Beach time");
      expect(op.moment.activities).toEqual([]);
      expect(op.moment.id).toMatch(/^mom_/);
    }
  });

  it("setDaySummaryOp carries the day id and text", () => {
    const op = setDaySummaryOp("day_2", "A slow, sunny one.");
    expect(op).toEqual({ op: "set_day_summary", day_id: "day_2", summary: "A slow, sunny one." });
  });

  it("newId is prefixed and reasonably unique", () => {
    const a = newId("x");
    const b = newId("x");
    expect(a.startsWith("x_")).toBe(true);
    expect(a).not.toBe(b);
  });

  it("MOMENT_SLOTS covers the renderer's slots", () => {
    expect(MOMENT_SLOTS).toContain("morning");
    expect(MOMENT_SLOTS).toContain("afternoon");
    expect(MOMENT_SLOTS).toContain("evening");
    expect(MOMENT_SLOTS).toContain("anytime");
  });
});
