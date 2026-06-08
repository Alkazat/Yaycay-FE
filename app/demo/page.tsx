import type { Metadata } from "next";
import { DemoClient } from "./DemoClient";

export const metadata: Metadata = {
  title: "Try the free demo - Yaycay",
  description: "See one day of your family holiday, built in a moment. For families making memories.",
};

/** /demo - free, no auth. The client component drives the form + render. */
export default function DemoPage() {
  return (
    <main className="yc-shell">
      <div className="yc-container">
        <DemoClient />
      </div>
    </main>
  );
}
