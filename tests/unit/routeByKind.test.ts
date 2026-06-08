import { describe, it, expect } from "vitest";
import { showsInView, activitiesForView } from "@/lib/render/routeByKind";
import type { Activity } from "@/lib/contract-mock/types";

function act(id: string, kind: Activity["kind"]): Activity {
  return { id, kind, title: id };
}

describe("showsInView", () => {
  it("shared shows in both views", () => {
    expect(showsInView("shared", "kid")).toBe(true);
    expect(showsInView("shared", "grownups")).toBe(true);
  });

  it("kid shows only in the kid view", () => {
    expect(showsInView("kid", "kid")).toBe(true);
    expect(showsInView("kid", "grownups")).toBe(false);
  });

  it("adult shows only in the grown-ups view", () => {
    expect(showsInView("adult", "grownups")).toBe(true);
    expect(showsInView("adult", "kid")).toBe(false);
  });
});

describe("activitiesForView", () => {
  const activities = [act("k", "kid"), act("s", "shared"), act("a", "adult")];

  it("kid view keeps kid + shared", () => {
    expect(activitiesForView(activities, "kid").map((a) => a.id)).toEqual(["k", "s"]);
  });

  it("grown-ups view keeps adult + shared", () => {
    expect(activitiesForView(activities, "grownups").map((a) => a.id)).toEqual(["s", "a"]);
  });

  it("preserves order", () => {
    expect(activitiesForView(activities, "kid")).toEqual([activities[0], activities[1]]);
  });
});
