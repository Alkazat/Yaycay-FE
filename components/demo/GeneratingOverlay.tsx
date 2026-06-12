"use client";

import { useEffect, useState } from "react";

const DEFAULT_STEPS = [
  "Packing the explorer bags",
  "Finding the best spots",
  "Building the day, hour by hour",
  "Adding a fun challenge",
  "Checking everything is allergy-safe",
  "Sprinkling the yay",
];

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
 * Full-screen "we're building it" overlay. Each step flips from waiting to done
 * on a timer; the final step holds on "waiting" until the real response arrives
 * and the overlay unmounts. Reassuring during the AI generation wait.
 */
export function GeneratingOverlay({
  open,
  title = "Building your day...",
  steps = DEFAULT_STEPS,
}: {
  open: boolean;
  title?: string;
  steps?: string[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) {
      setActive(0);
      return;
    }
    setActive(0);
    const id = setInterval(() => {
      // Hold on the last step until the response lands (overlay closes).
      setActive((a) => Math.min(a + 1, steps.length - 1));
    }, 850);
    return () => clearInterval(id);
  }, [open, steps.length]);

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
            const done = i < active;
            const waiting = i === active;
            const soon = i > active;
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
