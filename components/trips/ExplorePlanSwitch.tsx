"use client";

import type { TripMode } from "@/components/trips/useTripPlanning";

const OPTIONS: { value: TripMode; label: string; emoji: string }[] = [
  { value: "explore", label: "Exploring", emoji: "🧭" },
  { value: "plan", label: "Planning", emoji: "🗺️" },
];

/**
 * The trip's mode switch. Exploring is the everyday experience; Planning is the
 * grown-up workspace. Kept compact and always one tap away (the default lands on
 * Exploring). Only shown to grown-up profiles - planning is not a kid activity.
 */
export function ExplorePlanSwitch({
  mode,
  onChange,
}: {
  mode: TripMode;
  onChange: (mode: TripMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Trip mode"
      data-testid="explore-plan-switch"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        background: "var(--surface-sunk)",
        borderRadius: "var(--radius-md)",
      }}
    >
      {OPTIONS.map((o) => {
        const active = o.value === mode;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`yc-btn yc-btn--sm ${active ? "yc-btn--primary" : ""}`}
            style={active ? undefined : { background: "transparent", boxShadow: "none" }}
          >
            <span aria-hidden style={{ marginRight: 6 }}>
              {o.emoji}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
