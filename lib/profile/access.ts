import type { ChildProfile, ExplorerMode, ProfileType } from "@/lib/contract-mock/types";
import type { RenderView } from "@/lib/render/routeByKind";

/**
 * Profile identity + view access (the user-types model).
 *
 * Two independent axes drive everything here:
 *  - `type` (`child` | `guardian`)  - WHO the profile is; gates the views.
 *  - `mode` ({@link ExplorerMode})  - HOW content is written; drives the renderer.
 *
 * `standard` is the guardian voice (the Grown-ups view), NOT a child band; the
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

/**
 * A profile's type. An absent `type` (a pre-@0.13 payload) defaults to `child` -
 * the safe default, since it never auto-grants Grown-ups access.
 */
export function profileType(p: Pick<ChildProfile, "type">): ProfileType {
  return p.type ?? "child";
}

export function isGuardian(p: Pick<ChildProfile, "type">): boolean {
  return profileType(p) === "guardian";
}

export function isChild(p: Pick<ChildProfile, "type">): boolean {
  return profileType(p) === "child";
}

/**
 * The views a profile may enter. Children are locked to Explorers; only
 * guardians get the Grown-ups view (behind the PIN gate, see below).
 */
export function viewsForProfile(p: Pick<ChildProfile, "type">): RenderView[] {
  return isGuardian(p) ? ["kid", "grownups"] : ["kid"];
}

/** Whether a profile may reach the Grown-ups view at all. */
export function canAccessGrownups(p: Pick<ChildProfile, "type">): boolean {
  return isGuardian(p);
}

/**
 * Whether entering Grown-ups requires a PIN unlock first. Only guardians with a
 * configured PIN are gated; a guardian with no PIN set passes through (there is
 * nothing to verify yet).
 */
export function grownupsNeedsPin(p: Pick<ChildProfile, "type" | "pin_set">): boolean {
  return isGuardian(p) && !!p.pin_set;
}

/**
 * The kid-view render mode for a profile: a child's band, or the guardian voice
 * (`standard`) when a guardian co-explores. Defaults to `standard`.
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
