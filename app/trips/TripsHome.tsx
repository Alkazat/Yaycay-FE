"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listTrips } from "@/lib/api/trips";
import { TripCard } from "@/components/trips/TripCard";
import { Card, CardBody } from "@/components/ds";

export function TripsHome() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trips"],
    queryFn: ({ signal }) => listTrips(signal),
  });

  return (
    <div className="yc-stack">
      <header>
        <h1>Your trips</h1>
        <p style={{ color: "var(--text-muted)", fontWeight: 700 }}>
          For families making memories.
        </p>
      </header>

      {isLoading ? <p>Loading your adventures...</p> : null}

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
        <Card variant="soft">
          <CardBody>
            <p style={{ margin: 0 }}>
              No trips yet - let&apos;s plan your first adventure.{" "}
              <Link href="/demo">Try the demo</Link>.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {data && data.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: "var(--space-6)",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
          data-testid="trips-grid"
        >
          {data.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
