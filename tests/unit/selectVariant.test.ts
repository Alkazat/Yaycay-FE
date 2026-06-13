import { describe, it, expect } from "vitest";
import { selectActivityCopy } from "@/lib/render/selectVariant";
import type { Activity } from "@/lib/contract-mock/types";

const base: Activity = {
  id: "a1",
  kind: "kid",
  title: "Beach treasure hunt",
  body: "Base body copy.",
  variants: {
    little: { body: "Simpler read-aloud copy." },
    explorer_plus: {
      fact: "A fun fact.",
      quiz: { q: "What floats?", a: "A boat." },
    },
  },
};

describe("selectActivityCopy", () => {
  it("falls back to base body when no mode given", () => {
    const r = selectActivityCopy(base);
    expect(r.body).toBe("Base body copy.");
    expect(r.fact).toBeUndefined();
    expect(r.quiz).toBeUndefined();
  });

  it("uses the little variant body override", () => {
    const r = selectActivityCopy(base, "little");
    expect(r.body).toBe("Simpler read-aloud copy.");
  });

  it("falls back to base body when the variant has no body, and surfaces fact + quiz", () => {
    const r = selectActivityCopy(base, "explorer_plus");
    expect(r.body).toBe("Base body copy.");
    expect(r.fact).toBe("A fun fact.");
    expect(r.quiz).toEqual({ q: "What floats?", a: "A boat." });
  });

  it("handles an activity with no body and no variants", () => {
    const bare: Activity = { id: "a2", kind: "shared", title: "Stroll" };
    const r = selectActivityCopy(bare, "little");
    expect(r.title).toBe("Stroll");
    expect(r.body).toBe("");
  });

  it("ignores a mode that has no variant block", () => {
    const partial: Activity = {
      id: "a3",
      kind: "kid",
      title: "T",
      body: "Base.",
      variants: { little: { body: "Little." } },
    };
    expect(selectActivityCopy(partial, "explorer_plus").body).toBe("Base.");
  });

  it("explorer mode shows base copy when no explorer variant exists", () => {
    const r = selectActivityCopy(base, "explorer");
    expect(r.body).toBe("Base body copy.");
    expect(r.fact).toBeUndefined();
    expect(r.quiz).toBeUndefined();
  });

  it("uses an explorer variant body override when present", () => {
    const withExplorer: Activity = {
      id: "a4",
      kind: "kid",
      title: "T",
      body: "Base.",
      variants: { explorer: { body: "Explorer override." } },
    };
    expect(selectActivityCopy(withExplorer, "explorer").body).toBe("Explorer override.");
  });
});
