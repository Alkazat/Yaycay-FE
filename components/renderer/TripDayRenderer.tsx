"use client";

import type { ProfileMode, TripDay } from "@/lib/contract-mock/types";
import { activitiesForView, type RenderView } from "@/lib/render/routeByKind";
import { selectActivityCopy } from "@/lib/render/selectVariant";
import { Badge, Card, CardBody } from "@/components/ds";

interface TripDayRendererProps {
  day: TripDay;
  /** Which surface to fill: the kid view or the grown-ups view. */
  view: RenderView;
  /** Active child profile mode/age band (kid view only). */
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
 * `mode`, and surfaces `safety` notes in the grown-ups view only.
 *
 * It NEVER mutates trip content - it is a pure read of the contract payload.
 */
export function TripDayRenderer({ day, view, mode }: TripDayRendererProps) {
  return (
    <div className="yc-stack" data-testid="trip-day">
      <header>
        <Badge tone="sun">{day.label}</Badge>
        {day.summary ? (
          <p style={{ marginTop: "var(--space-3)", color: "var(--text-body)" }}>
            {day.summary}
          </p>
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

                    {copy.fact ? (
                      <p style={{ margin: 0, color: "var(--sky-700)", fontWeight: 700 }}>
                        Did you know? {copy.fact}
                      </p>
                    ) : null}

                    {copy.quiz ? (
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

                    {/* Safety flags surface only in the grown-ups view. */}
                    {view === "grownups" && activity.safety ? (
                      <p
                        style={{
                          margin: 0,
                          color: "var(--coral-500)",
                          fontWeight: 700,
                        }}
                      >
                        Safety: {activity.safety.note}
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
