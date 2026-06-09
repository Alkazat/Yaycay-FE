"use client";

import Link from "next/link";
import type { TripSummary } from "@/lib/contract-mock/types";
import { Card, CardBody, CardFooter, Badge } from "@/components/ds";
import { Countdown } from "@/components/Countdown";
import { formatDateRange } from "@/lib/format";

const STATUS_TONE: Record<TripSummary["status"], "sun" | "meadow" | "aqua" | "sky" | "soft"> = {
  draft: "soft",
  planning: "sun",
  ready: "meadow",
  holidaying: "sky",
  complete: "aqua",
  archived: "soft",
};

const TIER_LABEL: Record<TripSummary["tier"], string> = {
  free: "Demo",
  byo: "BYO-AI",
  ours: "Full",
};

/** A trip on the trips home. Links into the trip view. */
export function TripCard({ trip }: { trip: TripSummary }) {
  return (
    <Card interactive>
      <Link href={`/trips/${trip.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <CardBody title={trip.destination} subtitle={formatDateRange(trip.start_date, trip.end_date)}>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
            <Badge tone={STATUS_TONE[trip.status]}>{trip.status}</Badge>
            <Badge tone="soft">{TIER_LABEL[trip.tier]}</Badge>
            <Badge tone="soft">
              {trip.day_count} {trip.day_count === 1 ? "day" : "days"}
            </Badge>
          </div>
        </CardBody>
      </Link>
      <CardFooter>
        <Countdown startDate={trip.start_date} timezone={trip.timezone} />
      </CardFooter>
    </Card>
  );
}
