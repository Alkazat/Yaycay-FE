import Link from "next/link";
import Image from "next/image";

/**
 * Landing / entry. The marketing funnel proper lives in the Website thread;
 * this is the PWA's own front door into the free demo.
 */
export default function HomePage() {
  return (
    <main className="yc-shell">
      <div className="yc-container yc-stack" style={{ alignItems: "center", textAlign: "center" }}>
        <Image
          src="/icons/yaycay-logo.png"
          alt="Yaycay"
          width={220}
          height={220}
          priority
          style={{ width: "min(220px, 60vw)", height: "auto" }}
        />
        <h1 style={{ fontSize: "var(--fs-display)" }}>Plan the trip. Skip the stress. Keep the yay.</h1>
        <p style={{ fontSize: "var(--fs-lg)", maxWidth: "48ch" }}>
          One chat builds your whole family holiday. Every child gets their own adventure, grown-ups
          get a calm plan, and you keep the memories.
        </p>
        <Link href="/demo" className="yc-btn yc-btn--cta yc-btn--lg" style={{ textDecoration: "none" }}>
          Try the free demo
        </Link>
        <p style={{ color: "var(--text-muted)", fontWeight: 700 }}>For families making memories.</p>
      </div>
    </main>
  );
}
