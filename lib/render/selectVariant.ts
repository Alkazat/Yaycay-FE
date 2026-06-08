import type { Activity, ProfileMode } from "@/lib/contract-mock/types";

/** What the renderer actually paints for one activity in the kid view. */
export interface ResolvedActivityCopy {
  title: string;
  /** Best body copy for the active profile, falling back to the base body. */
  body: string;
  /** Present only when the active mode's variant supplies a fact. */
  fact?: string;
  /** Present only when the active mode's variant supplies a quiz. */
  quiz?: { q: string; a: string };
}

/**
 * Pick the rendered copy for an activity given the active child's mode.
 *
 * Variant resolution (per the FE handoff renderer spec):
 *   - choose `variants[mode]` for the active profile's mode/age band;
 *   - the variant's `body` overrides the base `body` when present;
 *   - ALWAYS fall back to the base `body` when no variant body is given;
 *   - `fact` and `quiz` are surfaced only from the matching variant.
 *
 * `mode` may be undefined (e.g. an adult-only profile or unset); we then render
 * the base copy.
 */
export function selectActivityCopy(
  activity: Activity,
  mode?: ProfileMode,
): ResolvedActivityCopy {
  const base = activity.body ?? "";
  const variant = mode ? activity.variants?.[mode] : undefined;

  return {
    title: activity.title,
    body: variant?.body ?? base,
    fact: variant?.fact,
    quiz: variant?.quiz,
  };
}
