"use client";

import type { ProfileMode, TripDay } from "@/lib/contract-mock/types";
import { activitiesForView, type RenderView } from "@/lib/render/routeByKind";
import { selectActivityCopy } from "@/lib/render/selectVariant";
import { ChallengeBlock } from "@/components/renderer/ChallengeBlock";
import { Badge, Card, CardBody } from "@/components/ds";

interface TripDayRendererProps {
  day: TripDay;
  /** Which surface to fill: the kid view or the grown-ups view. */
  view: RenderView;
  /** Active render mode (kid view). Defaults to standard. */
  mode?: ProfileMode;
}

const SLOT_LABEL: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  anytime: "Anytime",
};

/**
 * The core renderer. Walks a day's Moments -> Activities, filters by `kind`
 * for the active `view`, picks the right `variants` block for the active
 * `mode`, and surfaces day facts, typed challenges and `safety` notes.
 *
 * Challenges and fact bubbles are kid-view content; the typed challenge is
 * hidden in `little` mode. Safety notes show fully in the grown-ups view and as
 * a gentle "ask a grown-up" cue in the kid view. It NEVER mutates trip content.
 */
export function TripDayRenderer({ day, view, mode = "standard" }: TripDayRendererProps) {
  const isKid = view === "kid";

  return (
    <div className="yc-stack" data-testid="trip-day">
      <header className="yc-stack" style={{ gap: "var(--space-2)" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Badge tone="sun">{day.label}</Badge>
          {day.hotel ? <Badge tone="ink">{day.hotel}</Badge> : null}
        </div>
        {day.summary ? <p style={{ margin: 0, color: "var(--text-body)" }}>{day.summary}</p> : null}

        {isKid && day.did_you_know ? (
          <div
            style={{
              padding: "var(--space-3)",
              background: "var(--sun-50)",
              border: "2.5px solid var(--sun-200)",
              borderRadius: "var(--radius-md)",
              fontWeight: 700,
              color: "var(--royal-700)",
            }}
            data-testid="did-you-know"
          >
            Did you know? {day.did_you_know}
          </div>
        ) : null}

        {day.weather ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>{day.weather}</p>
        ) : null}
      </header>

      {day.moments.map((moment) => {
        const activities = activitiesForView(moment.activities, view);
        if (activities.length === 0) return null;

        return (
          <section key={moment.id} className="yc-stack">
            <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
              <Badge tone="aqua">{SLOT_LABEL[moment.slot] ?? moment.slot}</Badge>
              <h3 style={{ margin: 0 }}>{moment.title}</h3>
              {moment.time_hint ? (
                <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                  {moment.time_hint}
                </span>
              ) : null}
            </div>

            {activities.map((activity) => {
              const copy = selectActivityCopy(activity, mode);
              return (
                <Card key={activity.id} variant="soft">
                  <CardBody title={copy.title}>
                    {copy.body ? <p style={{ margin: 0 }}>{copy.body}</p> : null}

                    {activity.booking ? (
                      <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
                        {activity.booking.name}
                        {activity.booking.time ? ` - ${activity.booking.time}` : ""}
                      </p>
                    ) : null}

                    {/* Fact bubbles (kid view). */}
                    {isKid && activity.facts
                      ? activity.facts.map((fact, i) => (
                          <p
                            key={i}
                            style={{ margin: 0, color: "var(--sky-700)", fontWeight: 700 }}
                          >
                            Wow fact: {fact}
                          </p>
                        ))
                      : null}

                    {/* Explorer+ variant fact. */}
                    {isKid && copy.fact ? (
                      <p style={{ margin: 0, color: "var(--sky-700)", fontWeight: 700 }}>
                        Did you know? {copy.fact}
                      </p>
                    ) : null}

                    {/* Typed challenge - kid view, hidden in little mode. */}
                    {isKid && mode !== "little" && activity.challenge ? (
                      <ChallengeBlock challenge={activity.challenge} />
                    ) : null}

                    {/* Explorer+ variant quiz. */}
                    {isKid && copy.quiz ? (
                      <div
                        style={{
                          marginTop: "var(--space-2)",
                          padding: "var(--space-3)",
                          background: "var(--surface-sunk)",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <strong>Quiz:</strong> {copy.quiz.q}
                      </div>
                    ) : null}

                    {/* Safety: full note for grown-ups, gentle cue for kids. */}
                    {view === "grownups" && activity.safety ? (
                      <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
                        Safety: {activity.safety.note}
                      </p>
                    ) : null}
                    {isKid && activity.safety ? (
                      <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
                        Check with a grown-up before you eat here.
                      </p>
                    ) : null}
                  </CardBody>
                </Card>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
