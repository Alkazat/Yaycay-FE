"use client";

import { useEffect, useState } from "react";
import { AiOrb } from "@/components/ai/AiOrb";

const WORDS = ["Thinking", "Finding ideas", "Checking the plan", "Writing"];

/** Inline chat "thinking" state: a small AI orb + a cycling word. */
export function ChatThinking() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((x) => (x + 1) % WORDS.length), 1200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
      <AiOrb size={34} />
      <span
        key={i}
        className="yc-tick yc-tick-in"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--royal-700)" }}
      >
        {WORDS[i]}...
      </span>
    </span>
  );
}
