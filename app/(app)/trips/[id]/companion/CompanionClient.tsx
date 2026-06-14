"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getCompanion } from "@/lib/api/companion";
import type { CompanionCard } from "@/lib/contract-mock/types";
import { Card, CardBody, Badge, Banner, Button } from "@/components/ds";

/** A flag string is "lower risk" only when it literally says so; else treat as flagged. */
function flagTone(flag: string): "coral" | "sun" {
  return /lower risk/i.test(flag) ? "sun" : "coral";
}

function CompanionCardView({ card }: { card: CompanionCard }) {
  return (
    <Card>
      <CardBody title={card.prompt || "What's nearby"}>
        {card.near_label ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>{card.near_label}</p>
        ) : null}

        <div className="yc-stack" style={{ gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
          {card.options.map((opt) => (
            <div
              key={opt.name}
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md, 12px)",
                background: "var(--surface-sunken, #f4f4f5)",
              }}
            >
              <p style={{ margin: 0, fontWeight: 800 }}>{opt.name}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                {/* Allergy state always carries a text label, never colour alone. */}
                {opt.flags.map((f) => (
                  <Badge key={f} tone={flagTone(f)} dot>
                    {f}
                  </Badge>
                ))}
              </div>
              {opt.note ? (
                <p style={{ margin: "var(--space-2) 0 0", color: "var(--text-body)" }}>{opt.note}</p>
              ) : null}
            </div>
          ))}
        </div>

        {card.rain_plan ? (
          <div style={{ marginTop: "var(--space-3)" }}>
            <Banner tone="info" title={card.rain_plan.title}>
              {card.rain_plan.body}
            </Banner>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function CompanionClient({ tripId }: { tripId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["companion", tripId],
    queryFn: ({ signal }) => getCompanion(tripId, signal),
  });

  return (
    <div className="yc-stack" style={{ gap: "var(--space-4)", maxWidth: 640 }}>
      <header className="yc-stack" style={{ gap: "var(--space-2)" }}>
        <h1 style={{ margin: 0 }}>While you&rsquo;re there</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Quick answers for on the ground - with your family&apos;s allergy flags and confirm-on-the-day
          reminders already applied. The final check always stays with you.
        </p>
      </header>

      {isLoading ? <p>Loading nearby ideas...</p> : null}
      {isError ? <Banner tone="danger">We couldn&rsquo;t load this right now.</Banner> : null}

      {data && data.length === 0 ? (
        <Card variant="soft">
          <CardBody>
            <p style={{ margin: 0 }}>
              No companion cards yet. They appear once your trip is built.{" "}
              <Link href={`/trips/${tripId}/plan`} style={{ fontWeight: 800 }}>
                Plan your trip
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      ) : null}

      {data?.map((card) => <CompanionCardView key={card.id} card={card} />)}
    </div>
  );
}
