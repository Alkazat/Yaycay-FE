"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_STEPS = [
  "Packing the explorer bags",
  "Finding the best spots",
  "Building the day, hour by hour",
  "Adding a fun challenge",
  "Checking everything is allergy-safe",
  "Sprinkling the yay",
];

const NATURAL_MS = 7000;
const ACCEL_MS = 1000;
const DONE_HOLD_MS = 450;

/** Random, strictly-increasing completion times for `count` steps over `total`. */
function randomTimes(count: number, total: number): number[] {
  if (count <= 0) return [];
  const gaps = Array.from({ length: count }, () => 0.4 + Math.random());
  const sum = gaps.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return gaps.map((g) => {
    acc += g;
    return (acc / sum) * total;
  });
}

function Dot({ done }: { done: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 18,
        height: 18,
        flex: "none",
        display: "inline-grid",
        placeItems: "center",
        borderRadius: "var(--radius-pill)",
        border: "2.5px solid",
        borderColor: done ? "var(--meadow-500)" : "var(--sun-400)",
        background: done ? "var(--meadow-400)" : "transparent",
      }}
    >
      {done ? (
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span className="yc-gen-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--sun-400)" }} />
      )}
    </span>
  );
}

/**
 * Full-screen "we're building it" overlay.
 *
 * Steps 0..n-2 complete at random times over ~7s; the LAST step waits for the
 * response. When `ready` flips true the overlay finishes any remaining steps
 * (including the last) in ~1s, holds briefly on a fully-done list, then calls
 * `onComplete`. So the animation always runs to completion - never cut short -
 * whether the payload arrives early or late.
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
  const [doneCount, setDoneCount] = useState(0);

  const readyRef = useRef(ready);
  readyRef.current = ready;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!open) {
      setDoneCount(0);
      return;
    }
    setDoneCount(0);

    const start = Date.now();
    // Natural completion times for the first n-1 steps; the last waits for ready.
    const natural = randomTimes(Math.max(n - 1, 0), NATURAL_MS);

    let readyAt: number | null = null;
    let naturalDoneAtReady = 0;
    let finished = false;
    let completeTimer: number | undefined;

    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;

      if (readyRef.current && readyAt === null) {
        readyAt = elapsed;
        naturalDoneAtReady = natural.filter((t) => t <= elapsed).length;
      }

      let done: number;
      if (readyAt === null) {
        // Natural phase: only the first n-1 steps can complete here.
        done = natural.filter((t) => t <= elapsed).length;
      } else {
        // Accelerate everything remaining (incl. the last) over ~1s.
        const frac = Math.min(1, (elapsed - readyAt) / ACCEL_MS);
        const remaining = n - naturalDoneAtReady;
        done = Math.min(n, naturalDoneAtReady + Math.round(frac * remaining));
      }

      setDoneCount(done);

      if (done >= n && !finished) {
        finished = true;
        window.clearInterval(id);
        completeTimer = window.setTimeout(() => onCompleteRef.current(), DONE_HOLD_MS);
      }
    }, 80);

    return () => {
      window.clearInterval(id);
      if (completeTimer) window.clearTimeout(completeTimer);
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
      <div className="yc-container yc-stack" style={{ maxWidth: 460, gap: "var(--space-5)" }}>
        <h2 style={{ margin: 0, textAlign: "center", fontSize: "var(--fs-h2)", color: "var(--royal-700)" }}>
          {title}
        </h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {steps.map((label, i) => {
            const done = i < doneCount;
            const waiting = i === doneCount;
            const soon = i > doneCount;
            return (
              <li
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  opacity: soon ? 0.45 : 1,
                  transition: "opacity var(--dur-base) var(--ease-out)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  color: "var(--royal-700)",
                }}
              >
                <Dot done={done} />
                <span style={{ flex: 1 }}>{label}</span>
                <span
                  style={{
                    fontSize: "var(--fs-sm)",
                    fontWeight: 700,
                    color: done ? "var(--meadow-500)" : waiting ? "var(--sun-600)" : "var(--text-muted)",
                  }}
                >
                  {done ? "done" : waiting ? "waiting" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        .yc-gen-pulse { animation: yc-gen-pulse 1s var(--ease-bounce) infinite; }
        @keyframes yc-gen-pulse {
          0%, 100% { transform: scale(0.7); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .yc-gen-pulse { animation: none; }
        }
      `}</style>
    </div>
  );
}
