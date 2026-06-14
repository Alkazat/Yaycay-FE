import { describe, it, expect } from "vitest";
import {
  profileType,
  isParentCarer,
  isChild,
  viewsForProfile,
  canAccessGrownups,
  grownupsNeedsPin,
  modeForProfile,
  showsChallenge,
  showsBonus,
  MODE_LABEL,
} from "@/lib/profile/access";
import type { ChildProfile } from "@/lib/contract-mock/types";

function profile(p: Partial<ChildProfile>): ChildProfile {
  return {
    id: "p",
    name: "P",
    type: "child",
    pin_set: false,
    interests: [],
    dietary: [],
    medical: [],
    created_at: "",
    updated_at: "",
    ...p,
  };
}

describe("profileType", () => {
  it("defaults an absent type to child (safe, no Grown-ups)", () => {
    // A standard-mode legacy profile must NOT be auto-promoted to parent/carer.
    expect(profileType(profile({ mode: "standard" }))).toBe("child");
    expect(isChild(profile({}))).toBe(true);
  });

  it("honours an explicit type", () => {
    expect(isParentCarer(profile({ type: "parent_carer" }))).toBe(true);
    expect(isChild(profile({ type: "child" }))).toBe(true);
  });
});

describe("viewsForProfile", () => {
  it("locks children to the Explorers view", () => {
    expect(viewsForProfile(profile({ type: "child" }))).toEqual(["kid"]);
  });

  it("gives parent/carers both views", () => {
    expect(viewsForProfile(profile({ type: "parent_carer" }))).toEqual(["kid", "grownups"]);
  });

  it("canAccessGrownups follows the type", () => {
    expect(canAccessGrownups(profile({ type: "parent_carer" }))).toBe(true);
    expect(canAccessGrownups(profile({ type: "child" }))).toBe(false);
  });
});

describe("grownupsNeedsPin", () => {
  it("gates a parent/carer with a configured PIN", () => {
    expect(grownupsNeedsPin(profile({ type: "parent_carer", pin_set: true }))).toBe(true);
  });

  it("does not gate a parent/carer without a PIN", () => {
    expect(grownupsNeedsPin(profile({ type: "parent_carer", pin_set: false }))).toBe(false);
  });

  it("never gates a child (they cannot reach Grown-ups anyway)", () => {
    expect(grownupsNeedsPin(profile({ type: "child", pin_set: true }))).toBe(false);
  });
});

describe("modeForProfile", () => {
  it("uses the child's band", () => {
    expect(modeForProfile(profile({ mode: "explorer_plus" }))).toBe("explorer_plus");
  });

  it("defaults to standard (the parent/carer voice)", () => {
    expect(modeForProfile(profile({}))).toBe("standard");
  });
});

describe("content gating by mode", () => {
  it("hides the typed challenge for little only", () => {
    expect(showsChallenge("little")).toBe(false);
    expect(showsChallenge("explorer")).toBe(true);
    expect(showsChallenge("explorer_plus")).toBe(true);
    expect(showsChallenge("standard")).toBe(true);
  });

  it("shows bonus quiz/facts for Big Explorer only", () => {
    expect(showsBonus("explorer_plus")).toBe(true);
    expect(showsBonus("explorer")).toBe(false);
    expect(showsBonus("little")).toBe(false);
    expect(showsBonus("standard")).toBe(false);
  });
});

describe("MODE_LABEL", () => {
  it("uses the canonical user-type labels", () => {
    expect(MODE_LABEL.little).toBe("Little Explorer");
    expect(MODE_LABEL.explorer).toBe("Explorer");
    expect(MODE_LABEL.explorer_plus).toBe("Big Explorer");
    expect(MODE_LABEL.standard).toBe("Grown Ups");
  });
});
