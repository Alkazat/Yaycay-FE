"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSharedTrip } from "@/lib/api/trips";
import { Card, CardBody, Badge, Button, Banner } from "@/components/ds";
import { BrandLoading } from "@/components/shell/BrandLoading";
import { formatDateRange } from "@/lib/format";
import { flagForDestination } from "@/lib/geo";

/**
 * Public, read-only view of a shared trip. The recipient can look around the
 * itinerary but can't change anything; a prominent CTA lets them make their own
 * (paid) version. Resolved from the share token in the URL.
 */
export function SharedTripClient({ token }: { token: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-trip", token],
    queryFn: ({ signal }) => getSharedTrip(token, signal),
  });

  if (isLoading) return <BrandLoading label="Opening the trip…" />;

  if (isError || !data) {
    return (
      <div className="yc-stack" style={{ maxWidth: 640, margin: "0 auto" }}>
        <Banner tone="danger" title="This link isn’t available">
          The trip may have been unshared, or the link is wrong. Ask whoever shared it for a fresh
          link.
        </Banner>
        <Link href="/" style={{ fontWeight: 800 }}>
          Go to Yaycay
        </Link>
      </div>
    );
  }

  const { content, shared_by } = data;
  const trip = content.trip;
  const flag = flagForDestination(trip.destination);

  return (
    <div className="yc-stack" style={{ gap: "var(--space-5)", maxWidth: 760, margin: "0 auto" }}>
      <header className="yc-stack" style={{ gap: "var(--space-2)" }}>
        <Badge tone="aqua">Read-only · shared with you</Badge>
        <h1 style={{ margin: 0 }}>
          {flag ? `${flag} ` : ""}
          {trip.destination}
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          {trip.start_date && trip.end_date ? `${formatDateRange(trip.start_date, trip.end_date)} · ` : ""}
          Shared by {shared_by}
        </p>
      </header>

      <Card variant="soft">
        <CardBody title="Make this trip your own">
          <p style={{ margin: 0 }}>
            Like the look of it? Create your own version - a full holiday with day-by-day plans your
            family can explore.
          </p>
          <Link href="/auth?next=/trips" style={{ textDecoration: "none", marginTop: "var(--space-3)", display: "inline-block" }}>
            <Button variant="cta">Plan my own version</Button>
          </Link>
        </CardBody>
      </Card>

      <div className="yc-stack" style={{ gap: "var(--space-3)" }}>
        {content.days.map((day, i) => (
          <Card key={day.id}>
            <CardBody
              title={`Day ${i + 1}: ${day.label}`}
              subtitle={day.summary ?? undefined}
            >
              {day.moments.length > 0 ? (
                <ul style={{ margin: "var(--space-2) 0 0", paddingLeft: "var(--space-5)" }}>
                  {day.moments.map((m) => (
                    <li key={m.id} style={{ fontWeight: 600 }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 800, textTransform: "capitalize" }}>
                        {m.slot}
                      </span>{" "}
                      — {m.title}
                      {m.time_hint ? (
                        <span style={{ color: "var(--text-muted)", fontWeight: 700 }}> ({m.time_hint})</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>A free day to wander.</p>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
