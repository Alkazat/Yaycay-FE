"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTripContent, listProfiles } from "@/lib/api/trips";
import { getProgress, setActivityDone } from "@/lib/api/progress";
import { tripProgress, dayCompletion } from "@/lib/render/progress";
import { todayDayId } from "@/lib/render/today";
import { DayNav } from "@/components/trips/DayNav";
import { TripComplete } from "@/components/trips/TripComplete";
import type { RenderView } from "@/lib/render/routeByKind";
import { TripDayRenderer } from "@/components/renderer/TripDayRenderer";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { useActiveProfile } from "@/components/profile/ActiveProfileProvider";
import { StarBank } from "@/components/stars/StarBank";
import { GameLauncher } from "@/components/games/GameLauncher";
import { GrownupsGuide } from "@/components/grownups/GrownupsGuide";
import { Countdown } from "@/components/Countdown";
import { Tabs, Card, CardBody, Banner, ProgressMeter } from "@/components/ds";
import type { ProfileMode, TripProgress } from "@/lib/contract-mock/types";
import { formatDateRange } from "@/lib/format";

export function TripView({ tripId }: { tripId: string }) {
  const tripQuery = useQuery({
    queryKey: ["trip", tripId],
    queryFn: ({ signal }) => getTripContent(tripId, signal),
  });
  const profilesQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: ({ signal }) => listProfiles(signal),
  });

  const [view, setView] = useState<RenderView>("kid");
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [modeOverride, setModeOverride] = useState<ProfileMode | null>(null);
  const { activeProfileId, setActiveProfileId } = useActiveProfile();

  const trip = tripQuery.data;
  const profiles = profilesQuery.data ?? [];

  // Default selections once data arrives. The view lands on today during the
  // trip, otherwise day one.
  const todayId = trip ? todayDayId(trip.days, trip.trip.timezone) : null;
  const dayId = activeDayId ?? todayId ?? trip?.days[0]?.id ?? null;
  const profileId = activeProfileId ?? profiles[0]?.id ?? null;
  const activeProfile = profiles.find((p) => p.id === profileId) ?? null;
  // Render mode follows the active profile's default; a manual toggle overrides
  // it, which is also how Explorer+ is reached (the prototype orphaned it).
  const mode: ProfileMode = modeOverride ?? activeProfile?.mode ?? "standard";
  const anaphylactic = profiles.filter((p) => p.medical.includes("anaphylaxis"));

  const activeDay = useMemo(
    () => trip?.days.find((d) => d.id === dayId) ?? trip?.days[0],
    [trip, dayId],
  );

  const queryClient = useQueryClient();
  const progressKey = ["progress", tripId, profileId] as const;
  const progressQuery = useQuery({
    queryKey: progressKey,
    queryFn: ({ signal }) => getProgress(tripId, profileId!, signal),
    enabled: !!profileId,
  });
  const doneSet = useMemo(
    () => new Set(progressQuery.data?.done_items ?? []),
    [progressQuery.data],
  );

  const toggle = useMutation({
    mutationFn: ({ activityId, done }: { activityId: string; done: boolean }) =>
      setActivityDone(tripId, profileId!, activityId, done),
    onMutate: async ({ activityId, done }) => {
      await queryClient.cancelQueries({ queryKey: progressKey });
      const prev = queryClient.getQueryData<TripProgress>(progressKey);
      const next = new Set(prev?.done_items ?? []);
      if (done) next.add(activityId);
      else next.delete(activityId);
      queryClient.setQueryData<TripProgress>(progressKey, {
        profile_id: profileId ?? "",
        done_items: [...next],
        updated_at: new Date().toISOString(),
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(progressKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: progressKey }),
  });

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

  const tp = tripProgress(trip, doneSet);
  const tripComplete = tp.totalDays > 0 && tp.daysComplete === tp.totalDays;
  const dayItems = trip.days.map((d) => {
    const c = dayCompletion(d, doneSet);
    return { id: d.id, label: d.label, pct: c.pct, complete: c.complete };
  });

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
        <ProgressMeter
          value={tp.daysComplete}
          max={Math.max(tp.totalDays, 1)}
          label="Days explored"
          valueText={`${tp.daysComplete} / ${tp.totalDays}`}
          tone="meadow"
        />
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
          <Link
            href={`/trips/${tripId}/packing`}
            className="yc-btn yc-btn--secondary yc-btn--sm"
            style={{ textDecoration: "none" }}
          >
            Packing
          </Link>
          <Link
            href={`/trips/${tripId}/map`}
            className="yc-btn yc-btn--secondary yc-btn--sm"
            style={{ textDecoration: "none" }}
          >
            Map
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

      {view === "kid" && tripComplete ? (
        <TripComplete destination={trip.trip.destination} />
      ) : null}

      {view === "kid" && profiles.length > 0 ? (
        <ProfileSwitcher
          profiles={profiles}
          activeId={profileId}
          onSelect={(id) => {
            setActiveProfileId(id);
            // New explorer, follow their default mode again.
            setModeOverride(null);
          }}
        />
      ) : null}

      {view === "kid" && activeProfile && activeDay ? (
        <StarBank tripId={tripId} profile={activeProfile} day={activeDay} />
      ) : null}

      {view === "kid" && activeProfile && activeDay?.game ? (
        <div>
          <GameLauncher tripId={tripId} profile={activeProfile} day={activeDay} />
        </div>
      ) : null}

      {view === "kid" ? (
        <Tabs
          value={mode}
          onChange={(m: string) => setModeOverride(m as ProfileMode)}
          tabs={[
            { value: "standard", label: "Explorer" },
            { value: "little", label: "Little" },
            { value: "explorer", label: "Big explorer" },
            { value: "explorer_plus", label: "Explorer+" },
          ]}
        />
      ) : null}

      {view === "grownups" && anaphylactic.length > 0 ? (
        <Banner tone="danger" title="Allergy protocol">
          {anaphylactic
            .map((p) => `${p.name} (${p.dietary.join(", ") || "anaphylaxis"})`)
            .join("; ")}
          . Carry the EpiPen at all times and confirm every dish with the kitchen.
        </Banner>
      ) : null}

      {/* Day navigation: progress rings, today halo, completion discs. */}
      <DayNav days={dayItems} activeId={dayId} todayId={todayId} onSelect={setActiveDayId} />
      {todayId && todayId !== dayId ? (
        <div>
          <button
            type="button"
            className="yc-btn yc-btn--secondary yc-btn--sm"
            onClick={() => setActiveDayId(todayId)}
          >
            Jump to today
          </button>
        </div>
      ) : null}

      {activeDay ? (
        <TripDayRenderer
          day={activeDay}
          view={view}
          mode={mode}
          done={view === "kid" ? doneSet : undefined}
          onToggleActivity={
            view === "kid" && profileId
              ? (activityId, done) => toggle.mutate({ activityId, done })
              : undefined
          }
        />
      ) : null}

      {view === "grownups" && trip.grownups ? (
        <GrownupsGuide tripId={tripId} guide={trip.grownups} activeDayId={dayId} />
      ) : null}
    </div>
  );
}
