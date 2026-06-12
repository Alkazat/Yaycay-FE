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

const NATURAL_MS = 7000; // steps slip through over ~7s
const FINISH_MS = 1000; // the last step runs for ~1s once the payload lands
const DONE_HOLD_MS = 350; // brief "all done" beat before revealing

type Phase = "steps" | "orb" | "finishing";

/** Random, increasing completion times for `count` steps over `total`. */
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

/**
 * Full-screen "we're building it" overlay.
 *
 * - Steps 0..n-2 complete at random times over ~7s; the last step waits.
 * - If the wait runs past ~7s with no payload, it switches to a pulsating AI orb.
 * - When `ready` lands, the final "Sprinkling the yay" step runs for ~1s, then a
 *   brief all-done beat, then `onComplete`. So it always runs to completion.
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
  const [phase, setPhase] = useState<Phase>("steps");

  const readyRef = useRef(ready);
  readyRef.current = ready;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!open) {
      setDoneCount(0);
      setPhase("steps");
      return;
    }
    setDoneCount(0);
    setPhase("steps");

    const start = Date.now();
    const natural = randomTimes(Math.max(n - 1, 0), NATURAL_MS);
    let finishing = false;
    let intervalId = 0;
    const timeouts: number[] = [];

    const finish = () => {
      if (finishing) return;
      finishing = true;
      window.clearInterval(intervalId);
      setDoneCount(Math.max(n - 1, 0)); // everything but the last
      setPhase("finishing");
      // "Sprinkling the yay" runs for ~1s, then done, then reveal.
      timeouts.push(
        window.setTimeout(() => {
          setDoneCount(n);
          timeouts.push(window.setTimeout(() => onCompleteRef.current(), DONE_HOLD_MS));
        }, FINISH_MS),
      );
    };

    intervalId = window.setInterval(() => {
      if (readyRef.current) {
        finish();
        return;
      }
      const elapsed = Date.now() - start;
      const done = natural.filter((t) => t <= elapsed).length; // first n-1 only
      setDoneCount(done);
      if (done >= n - 1) setPhase("orb"); // overran ~7s, embrace the AI
    }, 80);

    return () => {
      window.clearInterval(intervalId);
      timeouts.forEach(window.clearTimeout);
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
      <div className="yc-container yc-stack" style={{ maxWidth: 460, gap: "var(--space-5)", alignItems: "center" }}>
        <h2 style={{ margin: 0, textAlign: "center", fontSize: "var(--fs-h2)", color: "var(--royal-700)" }}>
          {title}
        </h2>

        {phase === "orb" ? (
          <div className="yc-stack" style={{ alignItems: "center", gap: "var(--space-4)" }}>
            <AiOrb />
            <p style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--royal-700)" }}>
              Our AI is crafting something special...
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
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
        )}
      </div>

      <style>{`
        .yc-gen-pulse { animation: yc-gen-pulse 1s var(--ease-bounce) infinite; }
        @keyframes yc-gen-pulse { 0%,100%{transform:scale(.7);opacity:.6} 50%{transform:scale(1.15);opacity:1} }

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
          .yc-gen-pulse, .yc-orb-core, .yc-orb-ring, .yc-orb-spark { animation: none; }
        }
      `}</style>
    </div>
  );
}
