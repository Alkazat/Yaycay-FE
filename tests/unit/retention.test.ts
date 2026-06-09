import { describe, it, expect } from "vitest";
import { retentionStatus } from "@/lib/retention";

const NOW = Date.parse("2027-06-01T00:00:00Z");

describe("retentionStatus", () => {
  it("treats a kept trip as safe regardless of expiry", () => {
    const s = retentionStatus("2027-06-10", true, NOW);
    expect(s.kept).toBe(true);
    expect(s.expired).toBe(false);
    expect(s.soon).toBe(false);
  });

  it("treats a trip with no expiry as safe", () => {
    expect(retentionStatus(undefined, false, NOW).kept).toBe(true);
  });

  it("counts days left and flags soon within 60 days", () => {
    const s = retentionStatus("2027-06-28", false, NOW);
    expect(s.kept).toBe(false);
    expect(s.daysLeft).toBe(27);
    expect(s.soon).toBe(true);
    expect(s.expired).toBe(false);
  });

  it("is not soon when well in the future", () => {
    const s = retentionStatus("2027-12-31", false, NOW);
    expect(s.soon).toBe(false);
    expect(s.daysLeft).toBeGreaterThan(60);
  });

  it("flags expired once past", () => {
    const s = retentionStatus("2027-05-01", false, NOW);
    expect(s.expired).toBe(true);
    expect(s.daysLeft).toBe(0);
  });
});
