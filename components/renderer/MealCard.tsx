import type { MealCard } from "@/lib/contract-mock/types";
import { Badge, Banner } from "@/components/ds";

/** Flagged vs lower-risk - a text label always accompanies the tone. */
function stallTone(risk: "flagged" | "lower"): "coral" | "sun" {
  return risk === "flagged" ? "coral" : "sun";
}

function Rows({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: "var(--space-3)" }}>
      <p style={{ margin: 0, fontWeight: 800 }}>{title}</p>
      <ul style={{ margin: "var(--space-1) 0 0", paddingLeft: "var(--space-5)", color: "var(--text-body)" }}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Allergy-aware meal card: a headline text flag, the "what we checked /
 * confirm on the day" reasoning, flagged vs lower-risk stalls, a bilingual
 * ask-the-kitchen card, and an amber pre-order reminder. Allergy state is always
 * a text label (never colour alone) and never claims a dish is "safe".
 */
export function MealCardView({ meal }: { meal: MealCard }) {
  return (
    <div
      data-testid="meal-card"
      style={{
        marginTop: "var(--space-3)",
        padding: "var(--space-3)",
        borderRadius: "var(--radius-md, 12px)",
        border: "2.5px solid var(--coral-300, #f3b6a8)",
        background: "var(--surface, #fff)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
        <Badge tone="coral" dot>
          {meal.allergy_label}
        </Badge>
        <span style={{ fontWeight: 800 }}>{meal.venue}</span>
      </div>

      <Rows title="What we checked" items={meal.checked} />
      <Rows title="Confirm on the day" items={meal.confirm_on_day} />

      {meal.stalls.length > 0 ? (
        <div style={{ marginTop: "var(--space-3)" }}>
          <p style={{ margin: 0, fontWeight: 800 }}>Stalls</p>
          <div className="yc-stack" style={{ gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
            {meal.stalls.map((s) => (
              <div key={s.name} style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
                <Badge tone={stallTone(s.risk)} dot>
                  {s.label}
                </Badge>
                <span style={{ fontWeight: 700 }}>{s.name}</span>
                {s.note ? (
                  <span style={{ color: "var(--text-muted)", fontWeight: 600, flexBasis: "100%" }}>
                    {s.note}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Bilingual ask-the-kitchen card. */}
      <div
        data-testid="ask-kitchen"
        style={{
          marginTop: "var(--space-3)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-md, 12px)",
          background: "var(--sky-50, #f0f7ff)",
          border: "2px solid var(--sky-200, #cfe4fb)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 800 }}>Ask the kitchen</p>
        <p style={{ margin: "var(--space-2) 0 0", fontSize: "var(--fs-lg)", fontWeight: 700 }}>
          {meal.ask_kitchen.phrase}
        </p>
        <p style={{ margin: "var(--space-1) 0 0", color: "var(--text-muted)", fontWeight: 700 }}>
          {meal.ask_kitchen.english}
        </p>
        <p style={{ margin: "var(--space-1) 0 0", color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
          {meal.ask_kitchen.language} + English
        </p>
      </div>

      {/* Pre-meal reminder (amber) with confirm-before-you-order checklist. */}
      {meal.reminder ? (
        <div data-testid="meal-reminder" style={{ marginTop: "var(--space-3)" }}>
          <Banner tone="warning" title={`Before you order at ${meal.venue}`}>
            <span style={{ display: "block", fontWeight: 800, marginBottom: "var(--space-1)" }}>
              {meal.allergy_label}
            </span>
            <ul style={{ margin: 0, paddingLeft: "var(--space-5)" }}>
              {meal.reminder.confirm.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Banner>
        </div>
      ) : null}
    </div>
  );
}
