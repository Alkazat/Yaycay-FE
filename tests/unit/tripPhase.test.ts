import { describe, it, expect } from "vitest";
import { phaseFromTrips } from "@/lib/tripPhase";

type T = { start_date: string; end_date: string };

const NOW = new Date("2026-06-27T09:00:00.000Z");

describe("phaseFromTrips", () => {
  it("is travelling when a trip spans today (inclusive of the edges)", () => {
    expect(phaseFromTrips([{ start_date: "2026-06-26", end_date: "2026-06-28" }], NOW)).toBe(
      "travelling",
    );
    expect(phaseFromTrips([{ start_date: "2026-06-27", end_date: "2026-06-27" }], NOW)).toBe(
      "travelling",
    );
  });

  it("is planning before the trip starts or after it ends", () => {
    expect(phaseFromTrips([{ start_date: "2026-07-01", end_date: "2026-07-05" }], NOW)).toBe(
      "planning",
    );
    expect(phaseFromTrips([{ start_date: "2026-06-20", end_date: "2026-06-24" }], NOW)).toBe(
      "planning",
    );
  });

  it("is planning with no trips, and travelling if any one trip is active", () => {
    expect(phaseFromTrips([], NOW)).toBe("planning");
    expect(
      phaseFromTrips(
        [
          { start_date: "2026-01-01", end_date: "2026-01-03" },
          { start_date: "2026-06-26", end_date: "2026-06-28" },
        ],
        NOW,
      ),
    ).toBe("travelling");
  });

  it("ignores trips with missing dates", () => {
    const partial = [{ start_date: "", end_date: "" }] as T[];
    expect(phaseFromTrips(partial, NOW)).toBe("planning");
  });
});
