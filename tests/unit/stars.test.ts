import { describe, it, expect } from "vitest";
import { sgdValue, balanceFor, hasClaimed, STAR_VALUE } from "@/lib/stars";
import type { StarsResponse } from "@/lib/contract-mock/types";

const ledger: StarsResponse = {
  balances: [{ profile_id: "p", stars: 2 }],
  entries: [
    { id: "s1", profile_id: "p", source: "challenge", day: "d_2", stars: 1, created_at: "2026-06-27T00:00:00Z" },
    { id: "s2", profile_id: "p", source: "game:abc", day: "d_2", stars: 1, created_at: "2026-06-27T01:00:00Z" },
  ],
};

describe("stars", () => {
  it("values stars at the configured rate", () => {
    expect(sgdValue(0)).toBe(0);
    expect(sgdValue(4)).toBe(4 * STAR_VALUE);
  });

  it("reads a child's balance from the ledger", () => {
    expect(balanceFor(ledger, "p")).toBe(2);
    expect(balanceFor(ledger, "other")).toBe(0);
    expect(balanceFor(undefined, "p")).toBe(0);
  });

  it("detects an already-claimed source for a day (exact or prefixed source)", () => {
    expect(hasClaimed(ledger, "p", "d_2", "challenge")).toBe(true);
    expect(hasClaimed(ledger, "p", "d_2", "game")).toBe(true); // matches "game:abc"
    expect(hasClaimed(ledger, "p", "d_1", "challenge")).toBe(false);
    expect(hasClaimed(ledger, "other", "d_2", "challenge")).toBe(false);
    expect(hasClaimed(undefined, "p", "d_2", "challenge")).toBe(false);
  });
});
