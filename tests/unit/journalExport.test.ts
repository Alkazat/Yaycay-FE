import { describe, it, expect } from "vitest";
import { buildKeepsakeHtml, moodLabel } from "@/lib/journalExport";
import type { JournalEntryLocal, TripDay } from "@/lib/contract-mock/types";

const days: TripDay[] = [
  { id: "d1", date: "2026-06-26", label: "Arrival", moments: [] },
  { id: "d2", date: "2026-06-27", label: "Explorers", moments: [] },
];

const entries: JournalEntryLocal[] = [
  {
    id: "j1",
    trip_id: "t",
    profile_id: "p",
    day_id: "d1",
    note: "Best <day> ever",
    stars: 5,
    mood: "loved",
    created_at: "2026-06-26T10:00:00Z",
  },
];

describe("buildKeepsakeHtml", () => {
  const html = buildKeepsakeHtml({
    profileName: "Tay",
    destination: "Singapore",
    year: "2026",
    days,
    entries,
  });

  it("includes the profile, destination and the correct year (not hard-coded)", () => {
    expect(html).toContain("Tay's Singapore Adventure");
    expect(html).toContain("2026");
    expect(html).not.toContain("2025");
  });

  it("escapes user content", () => {
    expect(html).toContain("Best &lt;day&gt; ever");
    expect(html).not.toContain("Best <day> ever");
  });

  it("shows the mood label and a no-entry day", () => {
    expect(html).toContain("Loved it");
    expect(html).toContain("No entry written.");
  });
});

describe("moodLabel", () => {
  it("maps known moods and ignores unknown", () => {
    expect(moodLabel("wow")).toBe("Wow");
    expect(moodLabel("nope")).toBeUndefined();
  });
});
