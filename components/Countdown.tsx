"use client";

import { useEffect, useState } from "react";
import { computeCountdown, type Countdown as CountdownValue } from "@/lib/countdown";

interface CountdownProps {
  /** Holiday start date (YYYY-MM-DD or full ISO), saved in BE. */
  startDate: string;
  /** IANA timezone of the destination. */
  timezone: string;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * Live countdown to the start of the holiday, in the brand's "sleeps" voice.
 * Pure timing math lives in lib/countdown.ts; this only ticks and renders.
 */
export function Countdown({ startDate, timezone }: CountdownProps) {
  // Seed null to keep SSR and first client paint identical (avoids hydration
  // mismatch); the real value lands on mount.
  const [value, setValue] = useState<CountdownValue | null>(null);

  useEffect(() => {
    const tick = () => setValue(computeCountdown(startDate, timezone));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startDate, timezone]);

  if (!value) {
    return (
      <div className="yc-countdown" aria-live="polite" aria-busy="true">
        <span className="yc-countdown__lead">Counting down...</span>
      </div>
    );
  }

  if (value.started) {
    return (
      <div className="yc-countdown yc-countdown--go" aria-live="polite">
        <span className="yc-countdown__lead">The adventure has begun!</span>
      </div>
    );
  }

  const sleepsLabel = value.sleeps === 1 ? "sleep to go" : "sleeps to go";

  return (
    <div className="yc-countdown" aria-live="polite">
      <span className="yc-countdown__sleeps">
        {value.sleeps} {sleepsLabel}
      </span>
      <span className="yc-countdown__clock" aria-hidden="true">
        {value.days}d {pad(value.hours)}:{pad(value.minutes)}:{pad(value.seconds)}
      </span>
      <style>{`
        .yc-countdown {
          display: inline-flex; flex-direction: column; align-items: center;
          gap: var(--space-1);
          padding: var(--space-3) var(--space-6);
          background: var(--surface-card);
          border: var(--border-ink);
          border-radius: var(--radius-xl);
          box-shadow: var(--pop-sky), var(--gloss-top);
          font-family: var(--font-display);
        }
        .yc-countdown__sleeps {
          font-size: var(--fs-h3); font-weight: 600; color: var(--royal-700);
          line-height: var(--lh-tight);
        }
        .yc-countdown__clock {
          font-variant-numeric: tabular-nums; letter-spacing: var(--ls-wide);
          font-size: var(--fs-sm); color: var(--text-muted);
        }
        .yc-countdown__lead {
          font-size: var(--fs-h4); font-weight: 600; color: var(--royal-700);
        }
        .yc-countdown--go { box-shadow: var(--pop-sun), var(--gloss-top); }
      `}</style>
    </div>
  );
}
