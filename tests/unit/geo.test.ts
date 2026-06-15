import { describe, it, expect } from "vitest";
import { flagEmoji, formatCity, searchCities, flagForDestination } from "@/lib/geo";

describe("geo helpers", () => {
  it("turns an ISO-2 code into a flag emoji (and rejects junk)", () => {
    expect(flagEmoji("SG")).toBe("🇸🇬");
    expect(flagEmoji("au")).toBe("🇦🇺");
    expect(flagEmoji("XYZ")).toBe("");
    expect(flagEmoji("")).toBe("");
  });

  it("formats City, Region, Country (omitting an empty region)", () => {
    expect(formatCity({ name: "Tokyo", region: "Kanto", country: "Japan", cc: "JP" })).toBe(
      "Tokyo, Kanto, Japan",
    );
    expect(formatCity({ name: "Singapore", region: "", country: "Singapore", cc: "SG" })).toBe(
      "Singapore, Singapore",
    );
  });

  it("searches the curated set by prefix/substring", async () => {
    const r = await searchCities("toky");
    expect(r[0].name).toBe("Tokyo");
    expect((await searchCities("")).length).toBe(0);
  });

  it("derives a flag from a destination string", () => {
    expect(flagForDestination("Tokyo, Kanto, Japan")).toBe("🇯🇵");
    expect(flagForDestination("Nowhereville")).toBe("");
  });
});
