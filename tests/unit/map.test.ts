import { describe, it, expect } from "vitest";
import { collectPins, projectPins } from "@/lib/map";
import type { TripContent } from "@/lib/contract-mock/types";

const trip: TripContent = {
  trip: { id: "t", destination: "X", start_date: "2026-06-26", end_date: "2026-06-28", timezone: "UTC" },
  days: [
    {
      id: "d1",
      date: "2026-06-26",
      label: "Day 1",
      moments: [
        { id: "m1", slot: "morning", title: "South", location: { name: "South", lat: 1.0, lng: 103.0 }, activities: [] },
        { id: "m2", slot: "afternoon", title: "No geo", location: { name: "Unknown" }, activities: [] },
      ],
    },
    {
      id: "d2",
      date: "2026-06-27",
      label: "Day 2",
      moments: [
        { id: "m3", slot: "morning", title: "North", location: { name: "North", lat: 2.0, lng: 104.0 }, activities: [] },
      ],
    },
  ],
};

describe("collectPins", () => {
  it("collects only moments with lat/lng", () => {
    const pins = collectPins(trip);
    expect(pins.map((p) => p.id)).toEqual(["m1", "m3"]);
    expect(pins[0]).toMatchObject({ name: "South", dayLabel: "Day 1" });
  });
});

describe("projectPins", () => {
  it("projects to x/y with north up and within padding", () => {
    const proj = projectPins(collectPins(trip));
    const south = proj.find((p) => p.id === "m1")!;
    const north = proj.find((p) => p.id === "m3")!;
    // Higher latitude (north) maps to a smaller y (towards the top).
    expect(north.y).toBeLessThan(south.y);
    for (const p of proj) {
      expect(p.x).toBeGreaterThanOrEqual(8);
      expect(p.x).toBeLessThanOrEqual(92);
    }
  });

  it("returns nothing for no pins", () => {
    expect(projectPins([])).toEqual([]);
  });
});
