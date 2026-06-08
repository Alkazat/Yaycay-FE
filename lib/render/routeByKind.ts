import type { Activity, ActivityKind } from "@/lib/contract-mock/types";

/** Which rendered surface we are filling. */
export type RenderView = "kid" | "grownups";

/**
 * Should this activity appear in the given view?
 *
 * - `kid`      view shows `kind: "kid"` and `kind: "shared"`.
 * - `grownups` view shows `kind: "adult"` and `kind: "shared"`.
 *
 * `shared` shows in both; `kid` and `adult` are exclusive to their view.
 */
export function showsInView(kind: ActivityKind, view: RenderView): boolean {
  if (kind === "shared") return true;
  if (view === "kid") return kind === "kid";
  return kind === "adult";
}

/** Filter a list of activities down to those that belong in `view`. */
export function activitiesForView(
  activities: Activity[],
  view: RenderView,
): Activity[] {
  return activities.filter((a) => showsInView(a.kind, view));
}
