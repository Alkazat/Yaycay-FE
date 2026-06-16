"use client";

import { useEffect, useState, type CSSProperties } from "react";

const COLORS = [
  "var(--sun-400)",
  "var(--coral-400)",
  "var(--sky-400)",
  "var(--aqua-400)",
  "var(--meadow-400)",
];
const PIECES = 26;

/**
 * A lightweight, dependency-free confetti burst from screen centre. Bump `fireKey`
 * (e.g. a claim counter) to fire a burst; it auto-clears after ~1.5s. Decorative
 * and pointer-events-none, so it never blocks the UI, and is hidden under reduced
 * motion. Use for star claims, game wins and day-complete moments.
 */
export function Celebrate({ fireKey }: { fireKey: number }) {
  const [bursts, setBursts] = useState<number[]>([]);

  useEffect(() => {
    if (!fireKey) return;
    setBursts((b) => [...b, fireKey]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x !== fireKey)), 1500);
    return () => clearTimeout(t);
  }, [fireKey]);

  if (bursts.length === 0) return null;

  return (
    <div className="yc-celebrate" aria-hidden="true">
      {bursts.map((id) => (
        <div className="yc-celebrate__burst" key={id}>
          {Array.from({ length: PIECES }).map((_, i) => {
            const angle = (360 / PIECES) * i + (id % 24);
            const dist = 80 + (i % 5) * 22;
            const rad = (angle * Math.PI) / 180;
            const style: CSSProperties = {
              background: COLORS[i % COLORS.length],
              animationDelay: `${(i % 6) * 25}ms`,
            };
            (style as Record<string, string>)["--tx"] = `${Math.cos(rad) * dist}px`;
            (style as Record<string, string>)["--ty"] = `${Math.sin(rad) * dist}px`;
            return <span key={i} className="yc-celebrate__piece" style={style} />;
          })}
        </div>
      ))}
      <style>{`
        .yc-celebrate {
          position: fixed; inset: 0; z-index: 80;
          pointer-events: none; display: grid; place-items: center;
        }
        .yc-celebrate__burst { position: relative; }
        .yc-celebrate__piece {
          position: absolute; left: 0; top: 0;
          width: 10px; height: 14px; border-radius: 2px;
          animation: yc-confetti 1.3s var(--ease-bounce, cubic-bezier(.2,.8,.3,1)) forwards;
        }
        @keyframes yc-confetti {
          0% { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), calc(var(--ty) + 60px)) rotate(560deg) scale(.6); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .yc-celebrate { display: none; } }
      `}</style>
    </div>
  );
}
