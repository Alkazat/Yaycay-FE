import { describe, it, expect } from "vitest";
import { formatHumanDate, formatDateRange } from "@/lib/format";

describe("formatHumanDate", () => {
  it("formats a bare calendar date in UTC (no timezone slip)", () => {
    const out = formatHumanDate("2026-06-26");
    // ICU punctuation varies by environment; assert the meaningful parts.
    expect(out).toContain("Fri");
    expect(out).toContain("26");
    expect(out).toContain("Jun");
    expect(out).not.toContain("25");
    expect(out).not.toContain("27");
  });

  it("formats a full ISO timestamp", () => {
    const out = formatHumanDate("2026-12-25T10:00:00Z");
    expect(out).toContain("25");
    expect(out).toContain("Dec");
  });

  it("returns the input unchanged when unparseable", () => {
    expect(formatHumanDate("not-a-date")).toBe("not-a-date");
  });
});

describe("formatDateRange", () => {
  it("joins the start and end dates", () => {
    const out = formatDateRange("2026-06-26", "2026-06-28");
    expect(out).toContain("26");
    expect(out).toContain("28");
    expect(out).toContain("Jun");
    expect(out).toContain(" - ");
  });
});
