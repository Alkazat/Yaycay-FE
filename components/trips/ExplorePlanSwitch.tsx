"use client";

import type { TripMode } from "@/components/trips/useTripPlanning";

const OPTIONS: { value: TripMode; label: string; emoji: string; sub: string }[] = [
  { value: "explore", label: "Exploring", emoji: "🧭", sub: "the holiday, day by day" },
  { value: "plan", label: "Planning", emoji: "🗺️", sub: "build the trip with AI" },
];

/**
 * The trip's mode switch - the single control that flips the whole experience
 * between living the holiday (Exploring) and building it (Planning). It is the
 * hero of the trip header: a big, two-up segmented toggle, always one tap away.
 * Only shown to grown-up profiles - planning is not a kid activity.
 */
export function ExplorePlanSwitch({
  mode,
  onChange,
}: {
  mode: TripMode;
  onChange: (mode: TripMode) => void;
}) {
  return (
    <div role="tablist" aria-label="Trip mode" data-testid="explore-plan-switch" className="yc-mode-switch">
      {OPTIONS.map((o) => {
        const active = o.value === mode;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`yc-mode-switch__opt ${active ? "is-active" : ""}`}
          >
            <span aria-hidden className="yc-mode-switch__emoji">
              {o.emoji}
            </span>
            <span className="yc-mode-switch__text">
              <span className="yc-mode-switch__label">{o.label}</span>
              <span className="yc-mode-switch__sub">{o.sub}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
