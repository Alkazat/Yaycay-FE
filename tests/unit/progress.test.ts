import { describe, it, expect } from "vitest";
import { dayCompletion, tripProgress } from "@/lib/render/progress";
import type { TripContent, TripDay } from "@/lib/contract-mock/types";

function day(id: string, actIds: string[]): TripDay {
  return {
    id,
    date: "2026-06-26",
    label: id,
    moments: [
      {
        id: `${id}_m`,
        slot: "morning",
        title: "m",
        activities: actIds.map((aid) => ({ id: aid, kind: "kid" as const, title: aid })),
      },
    ],
  };
}

describe("dayCompletion", () => {
  it("counts ticked vs total and flags complete", () => {
    const d = day("d1", ["a", "b", "c"]);
    expect(dayCompletion(d, new Set(["a", "b"]))).toMatchObject({
      ticked: 2,
      total: 3,
      complete: false,
      pct: 67,
    });
    expect(dayCompletion(d, new Set(["a", "b", "c"])).complete).toBe(true);
  });

  it("a day with no activities is never complete", () => {
    const d = day("d0", []);
    expect(dayCompletion(d, new Set())).toMatchObject({ total: 0, complete: false, pct: 0 });
  });
});

describe("tripProgress", () => {
  const trip: TripContent = {
    trip: {
      id: "t",
      destination: "X",
      start_date: "2026-06-26",
      end_date: "2026-06-28",
      timezone: "UTC",
    },
    days: [day("d1", ["a", "b"]), day("d2", ["c"])],
  };

  it("counts a day explored only when all its activities are ticked", () => {
    expect(tripProgress(trip, new Set(["a"]))).toMatchObject({ daysComplete: 0, totalDays: 2 });
    expect(tripProgress(trip, new Set(["a", "b"]))).toMatchObject({ daysComplete: 1, pct: 50 });
    expect(tripProgress(trip, new Set(["a", "b", "c"]))).toMatchObject({
      daysComplete: 2,
      pct: 100,
    });
  });
});
