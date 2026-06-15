"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listTrips } from "@/lib/api/trips";
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
  const [creating, setCreating] = useState(false);

  return (
    <div className="yc-stack" data-testid="trips-home">
      <header>
        <h1 style={{ margin: 0 }}>Your trips</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          For families making memories.
        </p>
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
