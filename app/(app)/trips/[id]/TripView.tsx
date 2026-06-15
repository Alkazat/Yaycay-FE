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
import { PinGate } from "@/components/profile/PinGate";
import { useActiveProfile } from "@/components/profile/ActiveProfileProvider";
import {
  viewsForProfile,
  canAccessGrownups,
  grownupsNeedsPin,
  modeForProfile,
  isChild,
} from "@/lib/profile/access";
import { StarBank } from "@/components/stars/StarBank";
import { GameLauncher } from "@/components/games/GameLauncher";
import { GrownupsGuide } from "@/components/grownups/GrownupsGuide";
import { Countdown } from "@/components/Countdown";
import { Tabs, Card, CardBody, Banner, ProgressMeter } from "@/components/ds";
import type { ProfileMode, TripProgress } from "@/lib/contract-mock/types";
import { formatDateRange } from "@/lib/format";
import { useTripPlanning } from "@/components/trips/useTripPlanning";
import { useTripFeatures } from "@/components/trips/useTripFeatures";
import { ExplorePlanSwitch } from "@/components/trips/ExplorePlanSwitch";
import { PlanningPanel } from "@/components/trips/PlanningPanel";
import { resolveFeatures } from "@/lib/features";

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
  // Grown-ups stays unlocked for the session until the active profile changes
  // (or reload). `pinOpen` drives the PIN modal.
  const [grownupsUnlocked, setGrownupsUnlocked] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const { activeProfileId, setActiveProfileId } = useActiveProfile();
  // Explore (default) vs Plan mode (device-local) + the parent's per-explorer
  // feature overrides (BE-backed, synced across devices).
  const planning = useTripPlanning(tripId);
  const featureToggles = useTripFeatures(tripId);

  const trip = tripQuery.data;
  const profiles = profilesQuery.data ?? [];

  // Default selections once data arrives. The view lands on today during the
  // trip, otherwise day one.
  const todayId = trip ? todayDayId(trip.days, trip.trip.timezone) : null;
  const dayId = activeDayId ?? todayId ?? trip?.days[0]?.id ?? null;
  // Land on a kid-first experience: default to the first child explorer.
  const defaultProfileId = profiles.find((p) => isChild(p))?.id ?? profiles[0]?.id ?? null;
  const profileId = activeProfileId ?? defaultProfileId;
  const activeProfile = profiles.find((p) => p.id === profileId) ?? null;
  // Render mode follows the active profile's band (a child's age band, or the
  // parent/carer voice `standard`). The band is fixed per profile - no free toggle.
  const mode: ProfileMode = activeProfile ? modeForProfile(activeProfile) : "standard";
  // Resolved per-explorer features for the active profile (band preset + the
  // parent's overrides). Drives what shows in the Exploring experience.
  const features = resolveFeatures(
    mode,
    profileId ? featureToggles.overridesFor(profileId) : undefined,
  );
  // Planning is a grown-up activity: only parent/carers get the switch, and a
  // plan-mode flag left in storage is ignored while a child is active.
  const canPlan = !!activeProfile && canAccessGrownups(activeProfile);
  const showPlan = canPlan && planning.mode === "plan";
  // Which views this profile may enter; children are locked to Explorers.
  const allowedViews = activeProfile ? viewsForProfile(activeProfile) : ["kid"];
  // Never render a view the active profile can't access (e.g. after switching
  // from a parent/carer to a child while in Grown-ups).
  const effectiveView: RenderView = allowedViews.includes(view) ? view : "kid";
  const anaphylactic = profiles.filter((p) => p.medical.includes("anaphylaxis"));

  // Switch the active profile: reset the view + re-lock Grown-ups for the session.
  function selectProfile(id: string) {
    setActiveProfileId(id);
    setView("kid");
    setGrownupsUnlocked(false);
    setPinOpen(false);
  }

  // Tab change. Tapping Grown-ups prompts the PIN when the parent/carer has one set
  // and the session isn't already unlocked.
  function handleViewChange(next: RenderView) {
    if (next === "grownups") {
      if (!activeProfile || !canAccessGrownups(activeProfile)) return;
      if (grownupsUnlocked || !grownupsNeedsPin(activeProfile)) {
        setView("grownups");
      } else {
        setPinOpen(true);
      }
      return;
    }
    setView(next);
  }

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
        {canPlan ? <ExplorePlanSwitch mode={planning.mode} onChange={planning.setMode} /> : null}
        {/* Exploring tools. Per-explorer links honour the active explorer's
            toggles; Map and While-you're-there are trip-wide. Hidden in Plan. */}
        {!showPlan ? (
          <nav style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            {features.journal ? (
              <Link
                href={`/trips/${tripId}/journal`}
                className="yc-btn yc-btn--secondary yc-btn--sm"
                style={{ textDecoration: "none" }}
              >
                Journal
              </Link>
            ) : null}
            {features.packing ? (
              <Link
                href={`/trips/${tripId}/packing`}
                className="yc-btn yc-btn--secondary yc-btn--sm"
                style={{ textDecoration: "none" }}
              >
                Packing
              </Link>
            ) : null}
            <Link
              href={`/trips/${tripId}/map`}
              className="yc-btn yc-btn--secondary yc-btn--sm"
              style={{ textDecoration: "none" }}
            >
              Map
            </Link>
            <Link
              href={`/trips/${tripId}/companion`}
              className="yc-btn yc-btn--secondary yc-btn--sm"
              style={{ textDecoration: "none" }}
            >
              While you&apos;re there
            </Link>
          </nav>
        ) : null}
      </header>

      {showPlan ? (
        <PlanningPanel
          tripId={tripId}
          trip={trip}
          profiles={profiles}
          overridesFor={featureToggles.overridesFor}
          setOverride={featureToggles.setOverride}
          resetProfile={featureToggles.resetProfile}
        />
      ) : (
        <>
          {/* View toggle - only parent/carers get the Grown-ups tab; for a child it is
          absent (not just disabled). */}
          {allowedViews.length > 1 ? (
            <Tabs
              value={effectiveView}
              onChange={(v: string) => handleViewChange(v as RenderView)}
              tabs={allowedViews.map((v) => ({
                value: v,
                label: v === "kid" ? "Explorers" : "Grown-ups",
              }))}
            />
          ) : null}

          {effectiveView === "kid" && tripComplete ? (
            <TripComplete destination={trip.trip.destination} />
          ) : null}

          {effectiveView === "kid" && profiles.length > 0 ? (
            <ProfileSwitcher profiles={profiles} activeId={profileId} onSelect={selectProfile} />
          ) : null}

          {effectiveView === "kid" && features.pocket_money && activeProfile && activeDay ? (
            <StarBank tripId={tripId} profile={activeProfile} day={activeDay} />
          ) : null}

          {effectiveView === "kid" && features.games && activeProfile && activeDay?.game ? (
            <div>
              <GameLauncher tripId={tripId} profile={activeProfile} day={activeDay} />
            </div>
          ) : null}

          {effectiveView === "grownups" && anaphylactic.length > 0 ? (
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
              view={effectiveView}
              mode={mode}
              quizzes={features.quizzes}
              done={effectiveView === "kid" ? doneSet : undefined}
              onToggleActivity={
                effectiveView === "kid" && profileId
                  ? (activityId, done) => toggle.mutate({ activityId, done })
                  : undefined
              }
            />
          ) : null}

          {effectiveView === "grownups" && trip.grownups ? (
            <GrownupsGuide tripId={tripId} guide={trip.grownups} activeDayId={dayId} />
          ) : null}

          {pinOpen && activeProfile ? (
            <PinGate
              profileId={activeProfile.id}
              profileName={activeProfile.name}
              onUnlock={() => {
                setGrownupsUnlocked(true);
                setView("grownups");
                setPinOpen(false);
              }}
              onCancel={() => setPinOpen(false)}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
