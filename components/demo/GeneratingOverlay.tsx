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

const SHOW_MS = 1500; // each line is visible for ~1.5s
const EXIT_MS = 280; // fade-out-up duration (matches the CSS)
const FINISH_MS = 1000; // final "Sprinkling the yay" holds ~1s once the payload lands
const DONE_HOLD_MS = 400; // brief beat after the check before revealing

/** Brand "AI" orb: a glossy pulsing core with a sweeping conic ring (the spin). */
function AiOrb() {
  return (
    <div className="yc-orb-wrap" aria-hidden="true">
      <span className="yc-orb-ring" />
      <span className="yc-orb-core" />
      <span className="yc-orb-spark">&#10022;</span>
    </div>
  );
}

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

        <AiOrb />

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

      <style>{`
        .yc-tick { animation-duration: ${EXIT_MS}ms; animation-fill-mode: both; animation-timing-function: var(--ease-out); }
        .yc-tick-in { animation-name: yc-tick-in; }
        .yc-tick-out { animation-name: yc-tick-out; }
        @keyframes yc-tick-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes yc-tick-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-12px); } }

        .yc-orb-wrap { position: relative; width: 150px; height: 150px; display: grid; place-items: center; }
        .yc-orb-core {
          width: 112px; height: 112px; border-radius: 50%;
          background: radial-gradient(circle at 35% 28%, #e7f6fb 0%, var(--aqua-400) 42%, var(--sky-600) 100%);
          border: 3px solid var(--royal-600);
          box-shadow: 0 0 42px rgba(43,195,208,.55), var(--gloss-strong);
          animation: yc-orb-pulse 2.4s var(--ease-bounce) infinite;
        }
        .yc-orb-ring {
          position: absolute; inset: 0; border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0deg, var(--sun-400) 70deg, transparent 150deg);
          -webkit-mask: radial-gradient(circle, transparent 60px, #000 62px);
          mask: radial-gradient(circle, transparent 60px, #000 62px);
          animation: yc-orb-spin 2s linear infinite;
        }
        .yc-orb-spark { position: absolute; color: #fff; font-size: 30px; text-shadow: 0 0 10px rgba(255,255,255,.8); animation: yc-orb-spark 2.4s ease-in-out infinite; }
        @keyframes yc-orb-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes yc-orb-spin { to { transform: rotate(360deg); } }
        @keyframes yc-orb-spark { 0%,100%{transform:scale(.8);opacity:.7} 50%{transform:scale(1.18);opacity:1} }

        @media (prefers-reduced-motion: reduce) {
          .yc-tick, .yc-orb-core, .yc-orb-ring, .yc-orb-spark { animation: none; }
        }
      `}</style>
    </div>
  );
}
