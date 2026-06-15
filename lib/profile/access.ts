import type { ChildProfile, ExplorerMode, ProfileType } from "@/lib/contract-mock/types";
import type { RenderView } from "@/lib/render/routeByKind";

/**
 * Profile identity + view access (the user-types model).
 *
 * Two independent axes drive everything here:
 *  - `type` (`child` | `parent/carer`)  - WHO the profile is; gates the views.
 *  - `mode` ({@link ExplorerMode})  - HOW content is written; drives the renderer.
 *
 * `standard` is the parent/carer voice (the Grown-ups view), NOT a child band; the
 * three child bands are `little`, `explorer`, `explorer_plus`. See the user-types
 * handoff. These are pure helpers so the gate is unit-testable in isolation.
 */

/** Canonical, user-facing label for each mode/age band. */
export const MODE_LABEL: Record<ExplorerMode, string> = {
  little: "Little Explorer",
  explorer: "Explorer",
  explorer_plus: "Big Explorer",
  standard: "Grown Ups",
};

/** Emoji per band, for the profile chips. */
export const MODE_EMOJI: Record<ExplorerMode, string> = {
  little: "🐣",
  explorer: "🧭",
  explorer_plus: "🚀",
  standard: "🛡️",
};

/** Age range per band, shown on the band selector + chips. */
export const MODE_AGES: Record<ExplorerMode, string> = {
  little: "Ages 3-5",
  explorer: "Ages 6-8",
  explorer_plus: "Ages 9-12",
  standard: "Grown-up",
};

/** Avatar emoji choices for the profile picker (stored on `avatar`). */
export const AVATAR_EMOJIS = [
  "🦁", "🐯", "🦊", "🐼", "🐸", "🦄", "🐙", "🐢",
  "🦖", "🐝", "🌟", "🚀", "🐬", "🦉", "🐧", "🦕",
] as const;

/**
 * A profile's type. An absent `type` (a pre-@0.13 payload) defaults to `child` -
 * the safe default, since it never auto-grants Grown-ups access.
 */
export function profileType(p: Pick<ChildProfile, "type">): ProfileType {
  return p.type ?? "child";
}

export function isParentCarer(p: Pick<ChildProfile, "type">): boolean {
  return profileType(p) === "parent_carer";
}

export function isChild(p: Pick<ChildProfile, "type">): boolean {
  return profileType(p) === "child";
}

/**
 * The views a profile may enter. Children are locked to Explorers; only
 * parent/carers get the Grown-ups view (behind the PIN gate, see below).
 */
export function viewsForProfile(p: Pick<ChildProfile, "type">): RenderView[] {
  return isParentCarer(p) ? ["kid", "grownups"] : ["kid"];
}

/** Whether a profile may reach the Grown-ups view at all. */
export function canAccessGrownups(p: Pick<ChildProfile, "type">): boolean {
  return isParentCarer(p);
}

/**
 * Whether entering Grown-ups requires a PIN unlock first. Only parent/carers with a
 * configured PIN are gated; a parent/carer with no PIN set passes through (there is
 * nothing to verify yet).
 */
export function grownupsNeedsPin(p: Pick<ChildProfile, "type" | "pin_set">): boolean {
  return isParentCarer(p) && !!p.pin_set;
}

/**
 * The kid-view render mode for a profile: a child's band, or the parent/carer voice
 * (`standard`) when a parent/carer co-explores. Defaults to `standard`.
 */
export function modeForProfile(p: Pick<ChildProfile, "mode">): ExplorerMode {
  return p.mode ?? "standard";
}

/** Whether the typed puzzle challenge is shown for this mode (hidden for little). */
export function showsChallenge(mode: ExplorerMode): boolean {
  return mode !== "little";
}

/** Whether bonus quizzes / deep-dive facts are shown (Big Explorer only). */
export function showsBonus(mode: ExplorerMode): boolean {
  return mode === "explorer_plus";
}
