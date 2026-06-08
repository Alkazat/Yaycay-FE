"use client";

/**
 * Star rating - interactive (an accessible radiogroup) or read-only display.
 * Stars are whole 1-5 (see lib/journal clampStars). Tap targets are >=44px to
 * satisfy the touch hard-rule.
 */
interface StarRatingProps {
  value: number; // 0 = unrated
  onChange?: (stars: number) => void;
  /** Read-only display (no buttons). */
  readOnly?: boolean;
  label?: string;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path
        d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
        fill={filled ? "var(--sun-400)" : "none"}
        stroke={filled ? "var(--sun-600)" : "var(--sand-400)"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarRating({ value, onChange, readOnly = false, label = "Rating" }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  if (readOnly) {
    return (
      <span style={{ display: "inline-flex", gap: 2 }} aria-label={`${value} of 5 stars`}>
        {stars.map((s) => (
          <Star key={s} filled={s <= value} />
        ))}
      </span>
    );
  }

  return (
    <div role="radiogroup" aria-label={label} style={{ display: "inline-flex", gap: "var(--space-1)" }}>
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          role="radio"
          aria-checked={s === value}
          aria-label={`${s} ${s === 1 ? "star" : "stars"}`}
          onClick={() => onChange?.(s)}
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 44,
            height: 44,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            borderRadius: "var(--radius-sm)",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Star filled={s <= value} />
        </button>
      ))}
    </div>
  );
}
