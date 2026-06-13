import type { CSSProperties } from "react";

const CONFETTI_COLORS = [
  "var(--sun-400)",
  "var(--sky-500)",
  "var(--coral-400)",
  "var(--meadow-400)",
  "var(--aqua-400)",
];

// Deterministic confetti placement (stable across renders, no layout jitter).
const CONFETTI = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7 + 4) % 96}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: `${(i % 7) * 0.35}s`,
  duration: `${2.4 + (i % 4) * 0.5}s`,
}));

/** Terminal celebration shown once every day of the trip is complete. */
export function TripComplete({ destination }: { destination: string }) {
  return (
    <div
      className="yc-trip-complete"
      data-testid="trip-complete"
      role="status"
      style={{
        padding: "var(--space-6) var(--space-4)",
        textAlign: "center",
        background: "var(--grad-sunset)",
        border: "var(--border-ink)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--pop-sun), var(--gloss-top)",
        fontFamily: "var(--font-display)",
        color: "var(--royal-800)",
      }}
    >
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="yc-confetti"
          style={
            {
              left: c.left,
              background: c.color,
              animationDelay: c.delay,
              animationDuration: c.duration,
            } as CSSProperties
          }
        />
      ))}
      <div style={{ fontSize: "2.6rem", lineHeight: 1 }} aria-hidden>
        🏆
      </div>
      <h2 style={{ margin: "var(--space-3) 0 var(--space-2)" }}>Adventure complete!</h2>
      <p style={{ margin: 0, fontWeight: 600 }}>
        You explored every single day of {destination}. What a trip!
      </p>
    </div>
  );
}
