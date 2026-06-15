"use client";

import Link from "next/link";
import type { TripSummary } from "@/lib/contract-mock/types";
import { Card, CardBody, CardFooter, Badge, Button } from "@/components/ds";
import { Countdown } from "@/components/Countdown";
import { formatDateRange } from "@/lib/format";
import { tripPrimaryMode } from "@/lib/tripMode";

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

/**
 * A trip on the trips home. The card body opens the trip; two actions let the
 * family choose at the tile: Explore the days, or Plan the trip. The date-aware
 * primary (Explore when the trip is near/now, else Plan) is chosen here, so the
 * mode is picked before entering. Plan is gated to grown-ups inside the trip.
 */
export function TripCard({ trip }: { trip: TripSummary }) {
  const primary = tripPrimaryMode(trip);
  const exploreFirst = primary === "explore";

  return (
    <Card interactive>
      <Link href={`/trips/${trip.id}`} style={{ textDecoration: "none", color: "inherit" }}>
        <CardBody
          title={trip.destination}
          subtitle={
            trip.start_date && trip.end_date ? formatDateRange(trip.start_date, trip.end_date) : undefined
          }
        >
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
        <div className="yc-stack" style={{ gap: "var(--space-2)", width: "100%" }}>
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Link href={`/trips/${trip.id}?mode=${primary}`} style={{ flex: 1, textDecoration: "none" }}>
              <Button variant="cta" size="sm" block>
                {exploreFirst ? "Explore" : "Plan"}
              </Button>
            </Link>
            <Link
              href={`/trips/${trip.id}?mode=${exploreFirst ? "plan" : "explore"}`}
              style={{ flex: 1, textDecoration: "none" }}
            >
              <Button variant="secondary" size="sm" block>
                {exploreFirst ? "Plan" : "Explore"}
              </Button>
            </Link>
          </div>
          {trip.start_date && trip.timezone ? (
            <Countdown startDate={trip.start_date} timezone={trip.timezone} />
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
