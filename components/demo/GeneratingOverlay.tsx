"use client";

import { useEffect, useRef, useState } from "react";
import { AiOrb } from "@/components/ai/AiOrb";

const DEFAULT_STEPS = [
  "Packing the explorer bags",
  "Finding the best spots",
  "Building the day, hour by hour",
  "Adding a fun challenge",
  "Checking everything is allergy-safe",
  "Sprinkling the yay",
];

const SHOW_MS = 1500; // each line is visible for ~1.5s
const EXIT_MS = 280; // fade-out-up duration (matches the CSS)
const FINISH_MS = 1000; // final "Sprinkling the yay" holds ~1s once the payload lands
const DONE_HOLD_MS = 400; // brief beat after the check before revealing

function Check() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--meadow-500)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * Full-screen "we're building it" overlay: a brand AI orb runs the whole time,
 * with a single step line cycling beneath it (fade-out-up, then fade-in-up).
 * When `ready` lands it settles on the final step with a check for ~1s, then a
 * brief beat, then `onComplete`. Always runs to completion.
 */
export function GeneratingOverlay({
  open,
  ready,
  onComplete,
  title = "Building your day...",
  steps = DEFAULT_STEPS,
}: {
  open: boolean;
  ready: boolean;
  onComplete: () => void;
  title?: string;
  steps?: string[];
}) {
  const n = steps.length;
  const [idx, setIdx] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [finished, setFinished] = useState(false);

  const readyRef = useRef(ready);
  readyRef.current = ready;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!open) {
      setIdx(0);
      setExiting(false);
      setFinished(false);
      return;
    }
    setIdx(0);
    setExiting(false);
    setFinished(false);

    let cancelled = false;
    let finishing = false;
    const timers: number[] = [];
    const t = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    const finish = () => {
      if (finishing || cancelled) return;
      finishing = true;
      window.clearInterval(poll);
      setExiting(false);
      setIdx(n - 1);
      setFinished(true);
      t(() => t(() => onCompleteRef.current(), DONE_HOLD_MS), FINISH_MS);
    };

    const cycle = () => {
      if (cancelled || finishing) return;
      t(() => {
        if (cancelled || finishing) return;
        setExiting(true); // fade-out-up the current line
        t(() => {
          if (cancelled || finishing) return;
          setIdx((i) => (i + 1) % n); // swap + fade-in-up (key change)
          setExiting(false);
          cycle();
        }, EXIT_MS);
      }, SHOW_MS);
    };

    // Finish promptly whenever the payload is ready (even mid-line).
    const poll = window.setInterval(() => {
      if (readyRef.current) finish();
    }, 150);

    cycle();

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      timers.forEach(window.clearTimeout);
    };
  }, [open, n, steps]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      data-testid="generating"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "var(--cream-50)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:
          "calc(var(--safe-top) + var(--space-6)) var(--gutter) calc(var(--safe-bottom) + var(--space-6))",
      }}
    >
      <div className="yc-stack" style={{ alignItems: "center", gap: "var(--space-6)", maxWidth: 460 }}>
        <h2 style={{ margin: 0, textAlign: "center", fontSize: "var(--fs-h2)", color: "var(--royal-700)" }}>
          {title}
        </h2>

        <AiOrb size={150} />

        <div style={{ minHeight: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span
            key={finished ? "done" : idx}
            className={exiting ? "yc-tick yc-tick-out" : "yc-tick yc-tick-in"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "var(--fs-lg)",
              color: finished ? "var(--meadow-500)" : "var(--royal-700)",
            }}
          >
            {finished ? <Check /> : null}
            {steps[finished ? n - 1 : idx]}
          </span>
        </div>
      </div>
    </div>
  );
}
