"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Badge, Card, CardBody, Select, Tabs } from "@/components/ds";
import { PlanChat } from "@/components/chat/PlanChat";
import { ChatHistoryPanel } from "@/components/chat/ChatHistoryPanel";
import { listTrips, patchTripContent } from "@/lib/api/trips";
import { getPacking } from "@/lib/api/packing";
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
import type { ChildProfile, Moment, PackingList, PatchOp, Tier, TripContent } from "@/lib/contract-mock/types";

interface PlanningPanelProps {
  tripId: string;
  trip: TripContent;
  profiles: ChildProfile[];
  overridesFor: (profileId: string) => FeatureOverrides;
  setOverride: (profileId: string, key: TripFeatureKey, value: boolean) => void;
  resetProfile: (profileId: string) => void;
}

function packCounts(list: PackingList): { checked: number; total: number } {
  const items = list.sections.flatMap((s) => s.items);
  return { checked: items.filter((i) => i.checked).length, total: items.length };
}

/**
 * The Planning workspace: a tabbed main area (Chat by default, Manual for
 * quick-adds + per-explorer toggles) beside a sidebar that shows the whole-trip
 * itinerary, a per-profile preview, and the packing lists. The trip is the single
 * source of truth - everything here saves onto it.
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
  const [tab, setTab] = useState<"chat" | "manual">("chat");
  const [previewId, setPreviewId] = useState(explorers[0]?.id ?? "");

  const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: ({ signal }) => listTrips(signal) });
  const tier: Tier = tripsQuery.data?.find((t) => t.id === tripId)?.tier ?? "ours";
  const ent = entitlementsFor(tier);

  const packingQuery = useQuery({ queryKey: ["packing", tripId], queryFn: ({ signal }) => getPacking(tripId, signal) });

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

  const previewProfile = explorers.find((p) => p.id === previewId);
  const previewFeatures = previewProfile
    ? resolveFeatures(modeForProfile(previewProfile), overridesFor(previewProfile.id))
    : null;

  return (
    <div className="yc-stack" data-testid="planning-panel">
      <div
        className="yc-planning-grid"
        style={{
          display: "grid",
          gap: "var(--space-4)",
          gridTemplateColumns: "minmax(320px, 1fr) minmax(280px, 360px)",
          alignItems: "start",
        }}
      >
        {/* ---- Main: tabbed Chat / Manual ---------------------------------- */}
        <div className="yc-stack">
          <Tabs
            value={tab}
            onChange={(v: string) => setTab(v as "chat" | "manual")}
            tabs={[
              { value: "chat", label: "Chat" },
              { value: "manual", label: "Manual" },
            ]}
          />

          {tab === "chat" ? (
            <div className="yc-stack" data-testid="planning-chat">
              <ChatHistoryPanel tripId={tripId} />
              {ent.canUseOurAi ? <PlanChat tripId={tripId} /> : null}
              {ent.canUseByoConnector ? (
                <Card variant="soft">
                  <CardBody title="Bring your own AI">
                    <p style={{ margin: 0 }}>
                      Plan from your own ChatGPT, Claude or Gemini - it talks to Yaycay through a
                      secure connector.
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
          ) : (
            <div className="yc-stack" data-testid="planning-manual">
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
                      <input aria-label="Day date" type="date" value={dayDate} onChange={(e) => setDayDate(e.target.value)} />
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
                      <select aria-label="Moment time of day" value={momSlot} onChange={(e) => setMomSlot(e.target.value as Moment["slot"])}>
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

              <h3 style={{ margin: 0 }}>What each explorer gets</h3>
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
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
                        <Avatar name={profile.name} size={36} tone="aqua" />
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: "block" }}>{profile.name}</strong>
                          <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                            {MODE_EMOJI[band]} {MODE_LABEL[band]}
                          </span>
                        </div>
                        {customised > 0 ? (
                          <button type="button" className="yc-btn yc-btn--secondary yc-btn--sm" onClick={() => resetProfile(profile.id)}>
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
                                <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>{meta.blurb}</span>
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
          )}
        </div>

        {/* ---- Sidebar: itinerary + per-profile preview + packing --------- */}
        <aside className="yc-stack" data-testid="planning-sidebar">
          <Card variant="soft">
            <CardBody title="Trip itinerary">
              {trip.days.length === 0 ? (
                <p style={{ margin: 0 }}>No days yet. Start a chat or add one and it appears here.</p>
              ) : (
                <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
                  {trip.days.map((day) => (
                    <div key={day.id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <Badge tone="sun">{day.label}</Badge>
                      <span style={{ flex: 1, color: "var(--text-body)", minWidth: 0 }}>{day.summary ?? "—"}</span>
                      <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                        {day.moments.length}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {explorers.length > 0 ? (
            <Card variant="soft">
              <CardBody title="Preview for">
                <Select
                  label="Explorer"
                  value={previewId}
                  onChange={(e) => setPreviewId(e.target.value)}
                  options={explorers.map((p) => ({ value: p.id, label: p.name }))}
                />
                {previewFeatures ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "var(--space-2)" }}>
                    {FEATURE_KEYS.filter((k) => previewFeatures[k]).map((k) => (
                      <Badge key={k} tone="meadow">
                        {FEATURE_META[k].emoji} {FEATURE_META[k].label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardBody>
            </Card>
          ) : null}

          <Card variant="soft">
            <CardBody title="Packing">
              {packingQuery.data && packingQuery.data.length > 0 ? (
                <div className="yc-stack" style={{ gap: "var(--space-1)" }}>
                  {packingQuery.data.map((list) => {
                    const c = packCounts(list);
                    return (
                      <div key={list.id} style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)" }}>
                        <span style={{ fontWeight: 700 }}>{list.label}</span>
                        <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                          {c.checked}/{c.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>No packing lists yet.</p>
              )}
              <Link
                href={`/trips/${tripId}/packing`}
                className="yc-btn yc-btn--secondary yc-btn--sm"
                style={{ textDecoration: "none", marginTop: "var(--space-3)", display: "inline-block" }}
              >
                Open packing
              </Link>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
