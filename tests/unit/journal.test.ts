import { describe, it, expect } from "vitest";
import { clampStars, averageStars } from "@/lib/journal";

describe("clampStars", () => {
  it("clamps below 1 up to 1", () => {
    expect(clampStars(0)).toBe(1);
    expect(clampStars(-3)).toBe(1);
  });

  it("clamps above 5 down to 5", () => {
    expect(clampStars(9)).toBe(5);
  });

  it("rounds fractional ratings to a whole star", () => {
    expect(clampStars(3.4)).toBe(3);
    expect(clampStars(3.6)).toBe(4);
  });

  it("falls back to 1 for NaN", () => {
    expect(clampStars(Number.NaN)).toBe(1);
  });
});

describe("averageStars", () => {
  it("returns null when nothing is rated", () => {
    expect(averageStars([undefined, undefined])).toBeNull();
  });

  it("ignores unrated entries and rounds to one decimal", () => {
    expect(averageStars([5, 4, undefined])).toBe(4.5);
    expect(averageStars([5, 5, 4])).toBe(4.7);
  });
});
