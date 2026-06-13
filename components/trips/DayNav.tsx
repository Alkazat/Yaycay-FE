"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export interface DayNavItem {
  id: string;
  label: string;
  /** 0-100 completion for the day. */
  pct: number;
  complete: boolean;
}

interface DayNavProps {
  days: DayNavItem[];
  activeId: string | null;
  /** Id of the day happening today, or null. */
  todayId?: string | null;
  onSelect: (id: string) => void;
}

/**
 * The signature day rail: one chip per day with a conic progress ring (% of the
 * day's activities ticked), a gold halo on today, a full meadow disc when the
 * day is complete, and a pop animation when a day's progress advances. The
 * active chip is auto-scrolled into view. Replaces the plain day tabs.
 */
export function DayNav({ days, activeId, todayId, onSelect }: DayNavProps) {
  const prevPct = useRef<Record<string, number>>({});
  const [pulsing, setPulsing] = useState<Set<string>>(new Set());
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Pulse a chip whose completion just increased (a tick landed).
  useEffect(() => {
    const grew = days.filter((d) => d.pct > (prevPct.current[d.id] ?? d.pct)).map((d) => d.id);
    prevPct.current = Object.fromEntries(days.map((d) => [d.id, d.pct]));
    if (grew.length === 0) return;
    setPulsing(new Set(grew));
    const t = window.setTimeout(() => setPulsing(new Set()), 460);
    return () => window.clearTimeout(t);
  }, [days]);

  // Keep the active chip in view as the day changes.
  useEffect(() => {
    if (activeId) refs.current[activeId]?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div className="yc-daynav" role="tablist" aria-label="Trip days">
      {days.map((d, i) => (
        <button
          key={d.id}
          ref={(el) => {
            refs.current[d.id] = el;
          }}
          type="button"
          role="tab"
          aria-selected={d.id === activeId}
          aria-label={`${d.label}${d.complete ? ", complete" : `, ${d.pct}% done`}${
            d.id === todayId ? ", today" : ""
          }`}
          data-today={d.id === todayId}
          data-complete={d.complete}
          className={`yc-daychip${pulsing.has(d.id) ? " yc-daychip-pulse" : ""}`}
          onClick={() => onSelect(d.id)}
        >
          <span className="yc-daychip-ring" style={{ "--pct": d.pct } as CSSProperties}>
            <span className="yc-daychip-core">{d.complete ? "✓" : i + 1}</span>
          </span>
          <span className="yc-daychip-label">{d.label}</span>
        </button>
      ))}
    </div>
  );
}
