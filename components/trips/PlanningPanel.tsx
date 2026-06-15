"use client";

import Link from "next/link";
import { Avatar, Badge, Card, CardBody } from "@/components/ds";
import { isChild, modeForProfile, MODE_LABEL, MODE_EMOJI } from "@/lib/profile/access";
import {
  FEATURE_KEYS,
  FEATURE_META,
  resolveFeatures,
  overrideCount,
  type FeatureOverrides,
  type TripFeatureKey,
} from "@/lib/features";
import type { ChildProfile, TripContent } from "@/lib/contract-mock/types";

interface PlanningPanelProps {
  tripId: string;
  trip: TripContent;
  profiles: ChildProfile[];
  overridesFor: (profileId: string) => FeatureOverrides;
  setOverride: (profileId: string, key: TripFeatureKey, value: boolean) => void;
  resetProfile: (profileId: string) => void;
}

/**
 * The Planning workspace (Slice 1): where a grown-up shapes the trip and decides
 * what each explorer gets. It gathers the ways to build a trip (chat + the BYO-AI
 * connector, with manual editing on the way), a per-explorer feature toggle grid
 * (presets by age, override per child), and a consolidated whole-trip outline.
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

  return (
    <div className="yc-stack" data-testid="planning-panel">
      <Card variant="soft">
        <CardBody title="Build this trip">
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
            Plan together with Yaycay, bring your own AI, or add things yourself. It all saves
            straight onto the trip.
          </p>
          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              flexWrap: "wrap",
              marginTop: "var(--space-3)",
            }}
          >
            <Link
              href={`/trips/${tripId}/plan`}
              className="yc-btn yc-btn--primary yc-btn--sm"
              style={{ textDecoration: "none" }}
            >
              💬 Plan with chat
            </Link>
            <Link
              href="/connect"
              className="yc-btn yc-btn--secondary yc-btn--sm"
              style={{ textDecoration: "none" }}
            >
              🔌 Connect your AI
            </Link>
            <Link
              href={`/trips/${tripId}/packing`}
              className="yc-btn yc-btn--secondary yc-btn--sm"
              style={{ textDecoration: "none" }}
            >
              🧳 Packing
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* ---- Per-explorer feature toggles ---------------------------------- */}
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

      {/* ---- Consolidated whole-trip outline ------------------------------ */}
      <div className="yc-stack">
        <h2 style={{ margin: 0 }}>The whole trip</h2>
        <Card variant="soft">
          <CardBody>
            {trip.days.length === 0 ? (
              <p style={{ margin: 0 }}>
                No days planned yet. Start a chat above and Yaycay will build them with you.
              </p>
            ) : (
              <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
                {trip.days.map((day) => (
                  <div
                    key={day.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                    }}
                  >
                    <Badge tone="sun">{day.label}</Badge>
                    <span style={{ flex: 1, color: "var(--text-body)" }}>{day.summary ?? "—"}</span>
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
  );
}
