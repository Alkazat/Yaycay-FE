import { describe, it, expect } from "vitest";
import { tripPrimaryMode } from "@/lib/tripMode";

const DAY = 24 * 60 * 60 * 1000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

describe("tripPrimaryMode", () => {
  const now = Date.parse("2026-06-15");

  it("leads with Explore within 2 days before the start", () => {
    const t = { start_date: iso(now + 1 * DAY), end_date: iso(now + 5 * DAY) };
    expect(tripPrimaryMode(t, now)).toBe("explore");
  });

  it("leads with Explore during the trip", () => {
    const t = { start_date: iso(now - 1 * DAY), end_date: iso(now + 2 * DAY) };
    expect(tripPrimaryMode(t, now)).toBe("explore");
  });

  it("leads with Plan well before the trip", () => {
    const t = { start_date: iso(now + 30 * DAY), end_date: iso(now + 34 * DAY) };
    expect(tripPrimaryMode(t, now)).toBe("plan");
  });

  it("leads with Plan after the trip, and when no dates", () => {
    expect(tripPrimaryMode({ start_date: iso(now - 10 * DAY), end_date: iso(now - 5 * DAY) }, now)).toBe("plan");
    expect(tripPrimaryMode({ start_date: undefined, end_date: undefined }, now)).toBe("plan");
  });
});
