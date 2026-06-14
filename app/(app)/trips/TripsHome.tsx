"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { listTrips } from "@/lib/api/trips";
import Image from "next/image";
import { TripCard } from "@/components/trips/TripCard";
import { Card, CardBody } from "@/components/ds";
import { BrandLoading } from "@/components/shell/BrandLoading";

export function TripsHome() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trips"],
    queryFn: ({ signal }) => listTrips(signal),
  });

  return (
    <div className="yc-stack">
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
        <Card variant="soft">
          <CardBody>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-3)",
                textAlign: "center",
              }}
            >
              <Image src="/icons/yaycay-glyph.png" alt="" width={72} height={72} />
              <p style={{ margin: 0 }}>
                No trips yet - let&apos;s plan your first adventure.{" "}
                <Link href="/demo">Try the demo</Link>.
              </p>
            </div>
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
