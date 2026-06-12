import type { CSSProperties } from "react";

/**
 * Brand AI orb: a glossy pulsing core with a sweeping conic ring (the "spin")
 * and a sparkle. Size-driven via the `--orb` custom property; styles live in
 * app/globals.css so the orb is shared by the demo overlay and the chat.
 */
export function AiOrb({ size = 150 }: { size?: number }) {
  return (
    <div
      className="yc-orb-wrap"
      aria-hidden="true"
      style={{ width: size, height: size, ["--orb"]: `${size}px` } as CSSProperties}
    >
      <span className="yc-orb-ring" />
      <span className="yc-orb-core" />
      <span className="yc-orb-spark">&#10022;</span>
    </div>
  );
}
