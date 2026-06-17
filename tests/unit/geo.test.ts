import { describe, it, expect, afterEach, vi } from "vitest";
import { flagEmoji, formatCity, searchCities, flagForDestination } from "@/lib/geo";

afterEach(() => {
  vi.restoreAllMocks();
});

/** Offline by default: a rejecting fetch makes searchCities fall back to the curated set. */
function stubFetchOffline() {
  vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
}

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

  it("returns curated matches first, even when the live geocoder is unreachable", async () => {
    stubFetchOffline();
    const r = await searchCities("toky");
    expect(r[0].name).toBe("Tokyo");
    expect((await searchCities("")).length).toBe(0);
  });

  it("merges live geocoder results in after the curated favourites", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              features: [
                {
                  properties: {
                    name: "Toyama",
                    country: "Japan",
                    countrycode: "JP",
                    state: "Toyama",
                    osm_value: "city",
                  },
                },
              ],
            }),
        }),
      ),
    );
    const r = await searchCities("toy");
    const names = r.map((c) => c.name);
    expect(names).toContain("Toyama");
  });

  it("derives a flag from a destination string", () => {
    expect(flagForDestination("Tokyo, Kanto, Japan")).toBe("🇯🇵");
    expect(flagForDestination("Nowhereville")).toBe("");
  });
});
