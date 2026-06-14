import { describe, it, expect } from "vitest";
import {
  listProfiles,
  createProfile,
  setPin,
  verifyPin,
  deleteProfile,
} from "@/lib/contract-mock/profileStore";

/**
 * The mock PIN store backs the Grown-ups gate in mock/CI mode. e2e exercises the
 * full flow through the route handlers; these cover the store logic directly
 * (the route handlers are thin wrappers around it).
 */
describe("profileStore PIN", () => {
  it("verifies the seeded parent/carer PIN and rejects a wrong one", () => {
    // Mum (p_mum) is seeded with PIN 1234 and pin_set: true.
    const mum = listProfiles().find((p) => p.id === "p_mum");
    expect(mum?.pin_set).toBe(true);
    expect(verifyPin("p_mum", "1234")).toBe(true);
    expect(verifyPin("p_mum", "0000")).toBe(false);
  });

  it("never verifies a profile with no PIN configured", () => {
    // Savy (a child) has no PIN.
    expect(verifyPin("p_savy", "1234")).toBe(false);
  });

  it("setPin configures a PIN, flips pin_set, and the new PIN verifies", () => {
    const created = createProfile({ name: "Dad", type: "parent_carer" });
    expect(created.pin_set).toBe(false);
    expect(verifyPin(created.id, "5678")).toBe(false);

    const updated = setPin(created.id, "5678");
    expect(updated?.pin_set).toBe(true);
    expect(verifyPin(created.id, "5678")).toBe(true);
    expect(verifyPin(created.id, "5679")).toBe(false);

    deleteProfile(created.id);
  });

  it("setPin returns undefined for an unknown profile", () => {
    expect(setPin("nope", "1234")).toBeUndefined();
  });

  it("createProfile defaults type to child (the safe default)", () => {
    const kid = createProfile({ name: "Kiddo" });
    expect(kid.type).toBe("child");
    deleteProfile(kid.id);
  });
});
