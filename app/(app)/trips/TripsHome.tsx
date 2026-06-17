"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listTrips, listProfiles } from "@/lib/api/trips";
import { TripCard } from "@/components/trips/TripCard";
import { CreateTripModal } from "@/components/trips/CreateTripModal";
import { Card, CardBody } from "@/components/ds";
import { BrandLoading } from "@/components/shell/BrandLoading";

/** Dotted "add a trip" tile that opens the create modal. */
function NewTripTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="new-trip-tile"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        minHeight: 168,
        borderRadius: "var(--radius-lg, 16px)",
        border: "2.5px dashed var(--sky-400, #6aa9e9)",
        background: "var(--sky-50, #f0f7ff)",
        color: "var(--royal-600)",
        cursor: "pointer",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
      }}
    >
      <span aria-hidden style={{ fontSize: 34, lineHeight: 1 }}>
        +
      </span>
      <span>New trip</span>
    </button>
  );
}

export function TripsHome() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trips"],
    queryFn: ({ signal }) => listTrips(signal),
  });
  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: ({ signal }) => listProfiles(signal),
  });
  const crew = profilesQuery.data ?? [];
  const [creating, setCreating] = useState(false);

  return (
    <div className="yc-stack" data-testid="trips-home">
      <header className="yc-home-hero">
        <span className="yc-home-hero__eyebrow" aria-hidden="true">
          ✨
        </span>
        <h1 className="yc-home-hero__title" style={{ margin: 0 }}>
          Your trips
        </h1>
        <p className="yc-home-hero__tag">For families making memories.</p>
        {crew.length > 0 ? (
          <div className="yc-home-hero__crew" aria-label="Your crew">
            {crew.map((p) => (
              <span key={p.id} className="yc-home-hero__member">
                <span className="yc-home-hero__avatar" aria-hidden="true">
                  {p.avatar ?? (p.name.trim()[0] ?? "?").toUpperCase()}
                </span>
                <span className="yc-home-hero__name">{p.name}</span>
              </span>
            ))}
          </div>
        ) : null}
        <style>{`
          .yc-home-hero {
            display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
            text-align: center;
            padding: var(--space-6) var(--space-4);
            border-radius: var(--radius-2xl, 24px);
            background:
              radial-gradient(120% 90% at 50% 0%, var(--sky-50, #eaf6ff) 0%, transparent 60%),
              var(--surface-card, #fff);
            border: var(--border-ink, 2.5px solid #0a4c8b);
            box-shadow: var(--card-lift), var(--gloss-top);
          }
          .yc-home-hero__eyebrow { font-size: 30px; line-height: 1; }
          .yc-home-hero__title {
            font-family: var(--font-display); font-weight: 700;
            font-size: var(--fs-h1, 2rem); color: var(--royal-700, #0a4c8b);
          }
          .yc-home-hero__tag { margin: 0; color: var(--text-muted, #5b6b7b); font-weight: 700; }
          .yc-home-hero__crew {
            display: flex; gap: var(--space-3); flex-wrap: wrap;
            justify-content: center; margin-top: var(--space-3);
          }
          .yc-home-hero__member { display: flex; flex-direction: column; align-items: center; gap: 2px; }
          .yc-home-hero__avatar {
            display: grid; place-items: center; width: 40px; height: 40px;
            border-radius: var(--radius-pill, 999px);
            background: var(--sky-100, #d6ecff); border: 2.5px solid var(--royal-500, #0a4c8b);
            font-weight: 800; font-size: 17px; color: var(--royal-700, #0a4c8b);
          }
          .yc-home-hero__name {
            font-family: var(--font-display); font-weight: 700;
            font-size: var(--fs-xs, .72rem); color: var(--royal-700, #0a4c8b);
          }
        `}</style>
      </header>

      {isLoading ? <BrandLoading label="Loading your adventures…" /> : null}

      {isError ? (
        <Card variant="soft">
          <CardBody>
            <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
              Hmm, we couldn&apos;t load your trips. Give it another go?
            </p>
          </CardBody>
        </Card>
      ) : null}

      {data && data.length === 0 ? (
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          No trips yet - start one below, or <Link href="/connect">connect your AI</Link> to have it
          build one for you.
        </p>
      ) : null}

      {data ? (
        <div
          style={{
            display: "grid",
            gap: "var(--space-6)",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
          data-testid="trips-grid"
        >
          <NewTripTile onClick={() => setCreating(true)} />
          {data.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : null}

      {creating ? <CreateTripModal onClose={() => setCreating(false)} /> : null}
    </div>
  );
}
