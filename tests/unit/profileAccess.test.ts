import { describe, expect, it } from "vitest";
import {
  grownupsReady,
  isParentCarer,
  kidViewMode,
  needsPinPrompt,
  resolveRenderView,
} from "@/lib/profile/access";

const child = { type: "child" as const, mode: "explorer" as const, pin_set: false };
const parentNoPin = { type: "parent_carer" as const, mode: "standard" as const, pin_set: false };
const parentPin = { type: "parent_carer" as const, mode: "standard" as const, pin_set: true };

describe("profile access gating", () => {
  it("only parent/carer profiles are flagged as such", () => {
    expect(isParentCarer(child)).toBe(false);
    expect(isParentCarer(parentPin)).toBe(true);
    expect(isParentCarer(null)).toBe(false);
  });

  it("children can never reach the Grown-ups view", () => {
    expect(resolveRenderView("grownups", child, true)).toBe("kid");
    expect(grownupsReady(child, true)).toBe(false);
    expect(needsPinPrompt("grownups", child, false)).toBe(false);
  });

  it("a PIN-less parent/carer opens Grown-ups without a prompt", () => {
    expect(grownupsReady(parentNoPin, false)).toBe(true);
    expect(resolveRenderView("grownups", parentNoPin, false)).toBe("grownups");
    expect(needsPinPrompt("grownups", parentNoPin, false)).toBe(false);
  });

  it("a PIN-protected parent/carer is gated until unlocked", () => {
    expect(needsPinPrompt("grownups", parentPin, false)).toBe(true);
    expect(resolveRenderView("grownups", parentPin, false)).toBe("kid");
    // After unlocking this session:
    expect(needsPinPrompt("grownups", parentPin, true)).toBe(false);
    expect(resolveRenderView("grownups", parentPin, true)).toBe("grownups");
  });

  it("the kid view never uses the grown-ups 'standard' voice", () => {
    expect(kidViewMode(parentPin)).toBe("explorer");
    expect(kidViewMode(child)).toBe("explorer");
    expect(kidViewMode({ type: "child", mode: "little", pin_set: false })).toBe("little");
    expect(kidViewMode({ type: "child", mode: "explorer_plus", pin_set: false })).toBe(
      "explorer_plus",
    );
  });

  it("selecting the kid view is always kid regardless of profile", () => {
    expect(resolveRenderView("kid", parentPin, true)).toBe("kid");
    expect(resolveRenderView("kid", child, false)).toBe("kid");
  });
});
