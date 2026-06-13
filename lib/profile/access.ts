import type { ChildProfile, ProfileMode } from "@/lib/contract-mock/types";
import type { RenderView } from "@/lib/render/routeByKind";

type Profileish = Pick<ChildProfile, "type" | "mode" | "pin_set"> | null | undefined;

/** Parent/carer profiles can reach the Grown-ups view; children cannot. */
export function isParentCarer(profile: Profileish): boolean {
  return profile?.type === "parent_carer";
}

/**
 * Whether the Grown-ups view is currently accessible: the profile must be a
 * parent/carer, and either have no PIN set or have unlocked it this session.
 */
export function grownupsReady(profile: Profileish, unlocked: boolean): boolean {
  return isParentCarer(profile) && (!profile?.pin_set || unlocked);
}

/** The view actually rendered, after gating a child (or a locked gate) to kid. */
export function resolveRenderView(
  selected: RenderView,
  profile: Profileish,
  unlocked: boolean,
): RenderView {
  return selected === "grownups" && grownupsReady(profile, unlocked) ? "grownups" : "kid";
}

/** Whether to prompt for the PIN: a parent/carer chose Grown-ups but it's locked. */
export function needsPinPrompt(
  selected: RenderView,
  profile: Profileish,
  unlocked: boolean,
): boolean {
  return selected === "grownups" && isParentCarer(profile) && !!profile?.pin_set && !unlocked;
}

/**
 * The render band for the Explorers view. A parent/carer co-exploring uses a
 * child band rather than their `standard` (Grown Ups) voice.
 */
export function kidViewMode(profile: Profileish): ProfileMode {
  const m = profile?.mode ?? null;
  return m && m !== "standard" ? m : "explorer";
}
