import { describe, it, expect } from "vitest";
import { computeCountdown, resolveStartEpochMs } from "@/lib/countdown";

describe("resolveStartEpochMs", () => {
  it("treats a bare date as local midnight in the given timezone", () => {
    // Midnight 2026-07-01 in Singapore (UTC+8) is 2026-06-30T16:00:00Z.
    const epoch = resolveStartEpochMs("2026-07-01", "Asia/Singapore");
    expect(epoch).toBe(Date.parse("2026-06-30T16:00:00Z"));
  });

  it("treats a bare date in UTC as UTC midnight", () => {
    const epoch = resolveStartEpochMs("2026-07-01", "UTC");
    expect(epoch).toBe(Date.parse("2026-07-01T00:00:00Z"));
  });

  it("trusts a full ISO timestamp directly", () => {
    const epoch = resolveStartEpochMs("2026-07-01T09:30:00Z", "Asia/Singapore");
    expect(epoch).toBe(Date.parse("2026-07-01T09:30:00Z"));
  });
});

describe("computeCountdown", () => {
  it("breaks down the remaining time", () => {
    const now = Date.parse("2026-07-01T00:00:00Z");
    // start exactly 2 days, 3 hours, 4 minutes, 5 seconds later
    const start = "2026-07-03T03:04:05Z";
    const c = computeCountdown(start, "UTC", now);
    expect(c.started).toBe(false);
    expect(c.days).toBe(2);
    expect(c.hours).toBe(3);
    expect(c.minutes).toBe(4);
    expect(c.seconds).toBe(5);
  });

  it("rounds sleeps up for a partial day remaining", () => {
    const now = Date.parse("2026-07-01T00:00:00Z");
    // 1 day + 1 hour out -> 2 sleeps
    const c = computeCountdown("2026-07-02T01:00:00Z", "UTC", now);
    expect(c.sleeps).toBe(2);
  });

  it("reports started once the start moment has passed", () => {
    const now = Date.parse("2026-07-05T00:00:00Z");
    const c = computeCountdown("2026-07-01T00:00:00Z", "UTC", now);
    expect(c.started).toBe(true);
    expect(c.ms).toBe(0);
    expect(c.sleeps).toBe(0);
  });

  it("never goes negative", () => {
    const now = Date.parse("2030-01-01T00:00:00Z");
    const c = computeCountdown("2026-07-01", "UTC", now);
    expect(c.ms).toBe(0);
    expect(c.days).toBe(0);
  });
});
