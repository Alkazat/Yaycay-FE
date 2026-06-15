/**
 * First-run "make your first trip work for you" milestones. Pure derivation so
 * the checklist auto-ticks from live app state (trips, profiles, connections)
 * with no manual tracking, and the logic is unit-testable in isolation.
 */

export interface Milestone {
  key: string;
  label: string;
  done: boolean;
  href: string;
  /** Optional milestones don't keep the checklist open once the core is done. */
  optional?: boolean;
}

export interface FirstRunState {
  tripCount: number;
  hasExplorer: boolean;
  hasGrownupPin: boolean;
  connectedAssistants: number;
}

export function firstRunMilestones(s: FirstRunState): Milestone[] {
  return [
    { key: "trip", label: "Create your first trip", done: s.tripCount > 0, href: "/trips" },
    { key: "explorer", label: "Add an explorer", done: s.hasExplorer, href: "/profiles" },
    {
      key: "pin",
      label: "Protect Grown-ups with a PIN",
      done: s.hasGrownupPin,
      href: "/profiles",
    },
    {
      key: "ai",
      label: "Connect your AI (optional)",
      done: s.connectedAssistants > 0,
      href: "/connect",
      optional: true,
    },
  ];
}

export function completedCount(ms: Milestone[]): number {
  return ms.filter((m) => m.done).length;
}

export function allDone(ms: Milestone[]): boolean {
  return ms.length > 0 && ms.every((m) => m.done);
}

/** Core (non-optional) milestones all done - the checklist retires once true. */
export function coreComplete(ms: Milestone[]): boolean {
  const core = ms.filter((m) => !m.optional);
  return core.length > 0 && core.every((m) => m.done);
}
