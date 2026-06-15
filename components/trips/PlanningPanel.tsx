"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Badge, Card, CardBody } from "@/components/ds";
import { PlanChat } from "@/components/chat/PlanChat";
import { ChatHistoryPanel } from "@/components/chat/ChatHistoryPanel";
import { listTrips, patchTripContent } from "@/lib/api/trips";
import { entitlementsFor } from "@/lib/entitlements";
import { isChild, modeForProfile, MODE_LABEL, MODE_EMOJI } from "@/lib/profile/access";
import {
  FEATURE_KEYS,
  FEATURE_META,
  resolveFeatures,
  overrideCount,
  type FeatureOverrides,
  type TripFeatureKey,
} from "@/lib/features";
import { addDayOp, addMomentOp, MOMENT_SLOTS } from "@/lib/planOps";
import type { ChildProfile, Moment, PatchOp, Tier, TripContent } from "@/lib/contract-mock/types";

interface PlanningPanelProps {
  tripId: string;
  trip: TripContent;
  profiles: ChildProfile[];
  overridesFor: (profileId: string) => FeatureOverrides;
  setOverride: (profileId: string, key: TripFeatureKey, value: boolean) => void;
  resetProfile: (profileId: string) => void;
}

/**
 * The Planning workspace: a compelling chat infrastructure (Yaycay's planner +
 * the BYO-AI connector) sitting BESIDE a compact planner - manual quick-adds and
 * a consolidated whole-trip outline - plus the per-explorer feature toggles. The
 * trip is the single source of truth: everything here saves onto it.
 */
export function PlanningPanel({
  tripId,
  trip,
  profiles,
  overridesFor,
  setOverride,
  resetProfile,
}: PlanningPanelProps) {
  const explorers = profiles.filter((p) => isChild(p));

  // Tier drives which planning surfaces are available (our-AI vs BYO connector).
  const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: ({ signal }) => listTrips(signal) });
  const tier: Tier = tripsQuery.data?.find((t) => t.id === tripId)?.tier ?? "ours";
  const ent = entitlementsFor(tier);

  // Manual edits go through the same PatchOp vocabulary as chat; the trip query
  // refetches so the outline reflects the saved change (in live mode).
  const queryClient = useQueryClient();
  const patch = useMutation({
    mutationFn: (ops: PatchOp[]) => patchTripContent(tripId, { ops }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trip", tripId] }),
  });

  const [dayLabel, setDayLabel] = useState("");
  const [dayDate, setDayDate] = useState("");
  const [momDayId, setMomDayId] = useState("");
  const [momSlot, setMomSlot] = useState<Moment["slot"]>("morning");
  const [momTitle, setMomTitle] = useState("");

  function submitDay() {
    if (!dayLabel.trim()) return;
    patch.mutate([addDayOp(dayLabel.trim(), dayDate || undefined)]);
    setDayLabel("");
    setDayDate("");
  }
  function submitMoment() {
    const dayId = momDayId || trip.days[0]?.id;
    if (!dayId || !momTitle.trim()) return;
    patch.mutate([addMomentOp(dayId, momSlot, momTitle.trim())]);
    setMomTitle("");
  }

  return (
    <div className="yc-stack" data-testid="planning-panel">
      {/* ---- Chat BESIDE the compact planner (wraps to one column on narrow) -- */}
      <div
        style={{
          display: "grid",
          gap: "var(--space-4)",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          alignItems: "start",
        }}
      >
        {/* Chat column */}
        <div className="yc-stack" data-testid="planning-chat">
          <h2 style={{ margin: 0 }}>Plan together</h2>
          <ChatHistoryPanel tripId={tripId} />
          {ent.canUseOurAi ? <PlanChat tripId={tripId} /> : null}
          {ent.canUseByoConnector ? (
            <Card variant="soft">
              <CardBody title="Bring your own AI">
                <p style={{ margin: 0 }}>
                  Plan from your own ChatGPT, Claude or Gemini - it talks to Yaycay through a secure
                  connector.
                </p>
                <Link
                  href="/connect"
                  className="yc-btn yc-btn--secondary yc-btn--sm"
                  style={{ textDecoration: "none", marginTop: "var(--space-2)" }}
                >
                  🔌 Connect your AI
                </Link>
              </CardBody>
            </Card>
          ) : null}
          {!ent.canUseOurAi && !ent.canUseByoConnector ? (
            <Card variant="soft">
              <CardBody>
                <p style={{ margin: 0 }}>Planning unlocks with a full holiday.</p>
              </CardBody>
            </Card>
          ) : null}
        </div>

        {/* Planner column: quick-adds + consolidated outline */}
        <div className="yc-stack" data-testid="planning-planner">
          <h2 style={{ margin: 0 }}>The whole trip</h2>

          <Card variant="soft">
            <CardBody title="Add it yourself">
              <div className="yc-stack" style={{ gap: "var(--space-3)" }}>
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  <input
                    aria-label="New day name"
                    placeholder="New day, e.g. Day 3"
                    value={dayLabel}
                    onChange={(e) => setDayLabel(e.target.value)}
                    style={{ flex: "1 1 140px", minWidth: 0 }}
                  />
                  <input
                    aria-label="Day date"
                    type="date"
                    value={dayDate}
                    onChange={(e) => setDayDate(e.target.value)}
                  />
                  <button
                    type="button"
                    className="yc-btn yc-btn--secondary yc-btn--sm"
                    onClick={submitDay}
                    disabled={patch.isPending || !dayLabel.trim()}
                  >
                    + Day
                  </button>
                </div>

                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  <select
                    aria-label="Day for the new moment"
                    value={momDayId || trip.days[0]?.id || ""}
                    onChange={(e) => setMomDayId(e.target.value)}
                  >
                    {trip.days.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Moment time of day"
                    value={momSlot}
                    onChange={(e) => setMomSlot(e.target.value as Moment["slot"])}
                  >
                    {MOMENT_SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="New moment title"
                    placeholder="New moment, e.g. Beach time"
                    value={momTitle}
                    onChange={(e) => setMomTitle(e.target.value)}
                    style={{ flex: "1 1 140px", minWidth: 0 }}
                  />
                  <button
                    type="button"
                    className="yc-btn yc-btn--secondary yc-btn--sm"
                    onClick={submitMoment}
                    disabled={patch.isPending || trip.days.length === 0 || !momTitle.trim()}
                  >
                    + Moment
                  </button>
                </div>
                {patch.isError ? (
                  <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
                    That didn&apos;t save - give it another go.
                  </p>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <Card variant="soft">
            <CardBody>
              {trip.days.length === 0 ? (
                <p style={{ margin: 0 }}>
                  No days yet. Start a chat or add one above and it appears here.
                </p>
              ) : (
                <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
                  {trip.days.map((day) => (
                    <div
                      key={day.id}
                      style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
                    >
                      <Badge tone="sun">{day.label}</Badge>
                      <span style={{ flex: 1, color: "var(--text-body)" }}>
                        {day.summary ?? "—"}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                        {day.moments.length} {day.moments.length === 1 ? "moment" : "moments"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ---- Per-explorer feature toggles --------------------------------- */}
      <div className="yc-stack">
        <h2 style={{ margin: 0 }}>What each explorer gets</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Each explorer starts with sensible defaults for their age. Switch anything on or off just
          for them.
        </p>

        {explorers.length === 0 ? (
          <Card variant="soft">
            <CardBody>
              <p style={{ margin: 0 }}>
                Add an explorer first and you can tailor their experience here.{" "}
                <Link href="/profiles">Add a profile</Link>.
              </p>
            </CardBody>
          </Card>
        ) : null}

        {explorers.map((profile) => {
          const band = modeForProfile(profile);
          const overrides = overridesFor(profile.id);
          const resolved = resolveFeatures(band, overrides);
          const customised = overrideCount(band, overrides);
          return (
            <Card key={profile.id} variant="soft">
              <CardBody>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    marginBottom: "var(--space-3)",
                  }}
                >
                  <Avatar name={profile.name} size={36} tone="aqua" />
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: "block" }}>{profile.name}</strong>
                    <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                      {MODE_EMOJI[band]} {MODE_LABEL[band]}
                    </span>
                  </div>
                  {customised > 0 ? (
                    <button
                      type="button"
                      className="yc-btn yc-btn--secondary yc-btn--sm"
                      onClick={() => resetProfile(profile.id)}
                    >
                      Reset to defaults
                    </button>
                  ) : (
                    <Badge tone="aqua">Defaults</Badge>
                  )}
                </div>

                <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
                  {FEATURE_KEYS.map((key) => {
                    const meta = FEATURE_META[key];
                    const on = resolved[key];
                    return (
                      <label
                        key={key}
                        data-testid={`toggle-${profile.id}-${key}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-3)",
                          padding: "var(--space-2) var(--space-3)",
                          borderRadius: "var(--radius-md)",
                          background: on ? "var(--sun-50)" : "var(--surface-sunk)",
                          border: on ? "2.5px solid var(--sun-200)" : "2.5px solid var(--sand-200)",
                          cursor: "pointer",
                        }}
                      >
                        <span aria-hidden style={{ fontSize: 22 }}>
                          {meta.emoji}
                        </span>
                        <span style={{ flex: 1 }}>
                          <strong style={{ display: "block" }}>{meta.label}</strong>
                          <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                            {meta.blurb}
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={(e) => setOverride(profile.id, key, e.target.checked)}
                          style={{ width: 26, height: 26, accentColor: "var(--sun-400)" }}
                        />
                      </label>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
