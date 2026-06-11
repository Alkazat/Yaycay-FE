"use client";

import { useState } from "react";
import type { ActivityChallenge } from "@/lib/contract-mock/types";

const TYPE_LABEL: Record<ActivityChallenge["type"], string> = {
  quiz: "Quiz",
  spot: "Spot it",
  photo: "Photo challenge",
  challenge: "Challenge",
};

const TYPE_TONE: Record<ActivityChallenge["type"], string> = {
  quiz: "var(--sun-400)",
  spot: "var(--sky-400)",
  photo: "var(--coral-400)",
  challenge: "var(--meadow-400)",
};

/** A typed challenge with a reveal-answer toggle. Hidden in little mode. */
export function ChallengeBlock({ challenge }: { challenge: ActivityChallenge }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      style={{
        marginTop: "var(--space-2)",
        padding: "var(--space-3)",
        background: "var(--surface-sunk)",
        border: `2.5px solid ${TYPE_TONE[challenge.type]}`,
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "var(--fs-xs)",
          letterSpacing: "var(--ls-caps)",
          textTransform: "uppercase",
          color: TYPE_TONE[challenge.type],
        }}
      >
        {TYPE_LABEL[challenge.type]}
      </span>
      <p style={{ margin: 0, fontWeight: 700 }}>{challenge.question}</p>
      {revealed ? (
        <p style={{ margin: 0, color: "var(--royal-700)" }}>{challenge.answer}</p>
      ) : null}
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        className="yc-btn yc-btn--secondary yc-btn--sm"
        style={{ alignSelf: "flex-start" }}
        aria-expanded={revealed}
      >
        {revealed ? "Hide answer" : "Reveal the answer"}
      </button>
    </div>
  );
}
