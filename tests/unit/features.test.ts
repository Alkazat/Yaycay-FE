import { describe, it, expect } from "vitest";
import {
  FEATURE_KEYS,
  presetFor,
  resolveFeatures,
  isOverridden,
  overrideCount,
} from "@/lib/features";

describe("per-explorer feature presets", () => {
  it("a little explorer leads with games, no quizzes or pocket money", () => {
    const p = presetFor("little");
    expect(p.games).toBe(true);
    expect(p.quizzes).toBe(false);
    expect(p.pocket_money).toBe(false);
    expect(p.packing).toBe(true);
    expect(p.journal).toBe(true);
  });

  it("older explorers get quizzes + pocket money and grow out of mini-games", () => {
    for (const mode of ["explorer", "explorer_plus"] as const) {
      const p = presetFor(mode);
      expect(p.quizzes).toBe(true);
      expect(p.pocket_money).toBe(true);
      expect(p.games).toBe(false);
    }
  });

  it("returns a fresh copy each call (mutating one does not leak)", () => {
    const a = presetFor("explorer");
    a.quizzes = false;
    expect(presetFor("explorer").quizzes).toBe(true);
  });
});

describe("resolveFeatures (preset + overrides)", () => {
  it("with no overrides, equals the band preset", () => {
    expect(resolveFeatures("little")).toEqual(presetFor("little"));
  });

  it("applies a boolean override on top of the preset", () => {
    const r = resolveFeatures("little", { quizzes: true, games: false });
    expect(r.quizzes).toBe(true); // turned on against the little default
    expect(r.games).toBe(false); // turned off against the little default
    expect(r.packing).toBe(true); // untouched key keeps the preset
  });

  it("ignores undefined / partial override entries", () => {
    const r = resolveFeatures("explorer", { games: undefined } as never);
    expect(r.games).toBe(false); // stays at the explorer preset
    expect(r).toEqual(presetFor("explorer"));
  });

  it("covers exactly the documented feature keys", () => {
    expect(FEATURE_KEYS.sort()).toEqual(
      ["games", "journal", "packing", "pocket_money", "quizzes"].sort(),
    );
  });
});

describe("override bookkeeping", () => {
  it("isOverridden flags only values that differ from the preset", () => {
    expect(isOverridden("little", "quizzes", true)).toBe(true); // little default is false
    expect(isOverridden("little", "quizzes", false)).toBe(false);
    expect(isOverridden("explorer", "games", false)).toBe(false); // already the default
  });

  it("overrideCount counts only real deviations from the preset", () => {
    expect(overrideCount("explorer")).toBe(0);
    expect(overrideCount("explorer", { games: false })).toBe(0); // same as preset
    expect(overrideCount("explorer", { games: true })).toBe(1);
    expect(overrideCount("little", { quizzes: true, pocket_money: true, packing: true })).toBe(2);
  });
});
