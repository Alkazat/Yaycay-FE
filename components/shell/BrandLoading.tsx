import Image from "next/image";

/**
 * Branded loading state: the Yaycay glyph with a gentle pulse (reusing the
 * design-system `yc-orb-pulse` keyframe; the global reduced-motion rule stills
 * it). Safe both full-screen and inside the app chrome.
 */
export function BrandLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        minHeight: "48vh",
        padding: "var(--space-12) var(--gutter)",
      }}
    >
      <Image
        src="/icons/yaycay-glyph.png"
        alt=""
        width={84}
        height={84}
        style={{ animation: "yc-orb-pulse 1.6s var(--ease-bounce) infinite" }}
      />
      <p style={{ color: "var(--text-muted)", fontWeight: 700, margin: 0 }}>{label}</p>
    </div>
  );
}
