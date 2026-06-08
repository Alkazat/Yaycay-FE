import { describe, it, expect } from "vitest";
import { entitlementsFor, isPaidTier } from "@/lib/entitlements";

describe("entitlementsFor", () => {
  it("free tier can do none of the paid surfaces", () => {
    const e = entitlementsFor("free");
    expect(e).toEqual({
      canViewFullTrip: false,
      canUseOurAi: false,
      canUseByoConnector: false,
      canJournal: false,
      canUseOffline: false,
    });
  });

  it("ours tier unlocks our-AI chat (not the BYO connector)", () => {
    const e = entitlementsFor("ours");
    expect(e.canUseOurAi).toBe(true);
    expect(e.canUseByoConnector).toBe(false);
    expect(e.canViewFullTrip).toBe(true);
    expect(e.canJournal).toBe(true);
    expect(e.canUseOffline).toBe(true);
  });

  it("byo tier unlocks the connector (not our-AI chat)", () => {
    const e = entitlementsFor("byo");
    expect(e.canUseByoConnector).toBe(true);
    expect(e.canUseOurAi).toBe(false);
    expect(e.canViewFullTrip).toBe(true);
  });
});

describe("isPaidTier", () => {
  it.each([
    ["free", false],
    ["byo", true],
    ["ours", true],
  ] as const)("%s -> %s", (tier, expected) => {
    expect(isPaidTier(tier)).toBe(expected);
  });
});
