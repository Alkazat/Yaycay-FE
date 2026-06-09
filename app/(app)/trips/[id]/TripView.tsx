"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getTrip, listProfiles } from "@/lib/api/trips";
import type { RenderView } from "@/lib/render/routeByKind";
import { TripDayRenderer } from "@/components/renderer/TripDayRenderer";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { useActiveProfile } from "@/components/profile/ActiveProfileProvider";
import { Countdown } from "@/components/Countdown";
import { Tabs, Card, CardBody, Badge } from "@/components/ds";
import { formatDateRange } from "@/lib/format";

export function TripView({ tripId }: { tripId: string }) {
  const tripQuery = useQuery({
    queryKey: ["trip", tripId],
    queryFn: ({ signal }) => getTrip(tripId, signal),
  });
  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: ({ signal }) => listProfiles(signal),
  });

  const [view, setView] = useState<RenderView>("kid");
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const { activeProfileId, setActiveProfileId } = useActiveProfile();

  const trip = tripQuery.data;
  const profiles = profilesQuery.data ?? [];

  // Default selections once data arrives.
  const dayId = activeDayId ?? trip?.days[0]?.id ?? null;
  const profileId = activeProfileId ?? profiles[0]?.id ?? null;
  const activeProfile = profiles.find((p) => p.id === profileId) ?? null;

  const activeDay = useMemo(
    () => trip?.days.find((d) => d.id === dayId) ?? trip?.days[0],
    [trip, dayId],
  );

  if (tripQuery.isLoading) return <p>Loading your trip...</p>;
  if (tripQuery.isError || !trip) {
    return (
      <Card variant="soft">
        <CardBody>
          <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
            We couldn&apos;t open this trip. Give it another go?
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="yc-stack" data-testid="trip-view">
      <header className="yc-stack" style={{ gap: "var(--space-3)" }}>
        <h1 style={{ margin: 0 }}>{trip.trip.destination}</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          {formatDateRange(trip.trip.start_date, trip.trip.end_date)}
        </p>
        <div>
          <Countdown startDate={trip.trip.start_date} timezone={trip.trip.timezone} />
        </div>
        <nav style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <Link
            href={`/trips/${tripId}/plan`}
            className="yc-btn yc-btn--secondary yc-btn--sm"
            style={{ textDecoration: "none" }}
          >
            Plan
          </Link>
          <Link
            href={`/trips/${tripId}/journal`}
            className="yc-btn yc-btn--secondary yc-btn--sm"
            style={{ textDecoration: "none" }}
          >
            Journal
          </Link>
        </nav>
      </header>

      <Tabs
        value={view}
        onChange={(v: string) => setView(v as RenderView)}
        tabs={[
          { value: "kid", label: "Explorers" },
          { value: "grownups", label: "Grown-ups" },
        ]}
      />

      {view === "kid" && profiles.length > 0 ? (
        <ProfileSwitcher
          profiles={profiles}
          activeId={profileId}
          onSelect={setActiveProfileId}
        />
      ) : null}

      {/* Day navigation - one scroll context; tabs wrap rather than nest-scroll. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <Tabs
          value={dayId ?? ""}
          onChange={setActiveDayId}
          tabs={trip.days.map((d) => ({ value: d.id, label: d.label }))}
        />
      </div>

      {activeDay ? (
        <TripDayRenderer day={activeDay} view={view} mode={activeProfile?.mode} />
      ) : null}

      {view === "grownups" && trip.grownups ? (
        <Card variant="soft">
          <CardBody title="Grown-ups guide">
            {trip.grownups.essentials ? (
              <p style={{ margin: 0 }}>
                <strong>Essentials:</strong> {trip.grownups.essentials}
              </p>
            ) : null}
            {trip.grownups.transport ? (
              <p style={{ margin: 0 }}>
                <strong>Getting around:</strong> {trip.grownups.transport}
              </p>
            ) : null}
            {trip.grownups.checklist && trip.grownups.checklist.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                {trip.grownups.checklist.map((item) => (
                  <Badge key={item} tone="soft">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
