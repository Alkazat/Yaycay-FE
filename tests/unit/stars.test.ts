import { describe, it, expect } from "vitest";
import { sgdValue, claimKey, hasClaimed, STAR_VALUE } from "@/lib/stars";
import type { StarsState } from "@/lib/contract-mock/types";

describe("stars", () => {
  it("values stars at the configured rate", () => {
    expect(sgdValue(0)).toBe(0);
    expect(sgdValue(4)).toBe(4 * STAR_VALUE);
  });

  it("builds a per-day per-source idempotency key", () => {
    expect(claimKey("d_2", "challenge")).toBe("d_2:challenge");
    expect(claimKey("d_2", "game")).toBe("d_2:game");
  });

  it("detects an already-claimed source for a day", () => {
    const state: StarsState = {
      trip_id: "t",
      profile_id: "p",
      stars: 1,
      claims: ["d_2:challenge"],
    };
    expect(hasClaimed(state, "d_2", "challenge")).toBe(true);
    expect(hasClaimed(state, "d_2", "game")).toBe(false);
    expect(hasClaimed(state, "d_1", "challenge")).toBe(false);
  });
});
