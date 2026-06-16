"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfileMode, TripDay } from "@/lib/contract-mock/types";
import { activitiesForView, type RenderView } from "@/lib/render/routeByKind";
import { selectActivityCopy } from "@/lib/render/selectVariant";
import { showsChallenge, showsBonus } from "@/lib/profile/access";
import { ChallengeBlock } from "@/components/renderer/ChallengeBlock";
import { MealCardView } from "@/components/renderer/MealCard";
import { ReadAloud } from "@/components/renderer/ReadAloud";
import { dayCompletion } from "@/lib/render/progress";
import { dayEmoji, dayTone } from "@/components/trips/dayDecor";
import { activityScene } from "@/components/trips/activityScene";
import { Celebrate } from "@/components/ui/Celebrate";
import { Badge, Card, CardBody, CardMedia } from "@/components/ds";

interface TripDayRendererProps {
  day: TripDay;
  /** Which surface to fill: the kid view or the grown-ups view. */
  view: RenderView;
  /** Active render mode (kid view). Defaults to standard. */
  mode?: ProfileMode;
  /** 1-based position of this day in the trip, for the kid day header ("DAY N"). */
  dayNumber?: number;
  /** Whether quizzes (typed challenges + bonus) show for this explorer. Defaults
   * to on; the parent can turn them off per explorer in Planning. */
  quizzes?: boolean;
  /** Stable ids of ticked activities (kid view). */
  done?: ReadonlySet<string>;
  /** Tick/untick an activity. When provided, done-check rows render. */
  onToggleActivity?: (activityId: string, done: boolean) => void;
}

const SLOT_LABEL: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  anytime: "Anytime",
};

const REWARD_EMOJI = ["⭐", "🏆", "🌟", "🎉", "✨", "🦁", "🌴"];

/** Stable reward emoji per activity (same sticker every time it's revisited). */
function rewardFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return REWARD_EMOJI[h % REWARD_EMOJI.length];
}

/**
 * The core renderer. Walks a day's Moments -> Activities, filters by `kind`
 * for the active `view`, picks the right `variants` block for the active
 * `mode`, and surfaces day facts, typed challenges and `safety` notes.
 *
 * Challenges and fact bubbles are kid-view content; the typed challenge is
 * hidden in `little` mode. Safety notes show fully in the grown-ups view and as
 * a gentle "ask a grown-up" cue in the kid view. It NEVER mutates trip content.
 */
export function TripDayRenderer({
  day,
  view,
  mode = "standard",
  dayNumber,
  quizzes = true,
  done,
  onToggleActivity,
}: TripDayRendererProps) {
  const isKid = view === "kid";
  const doneSet = done ?? new Set<string>();
  const completion = dayCompletion(day, doneSet);
  const showChecks = isKid && !!onToggleActivity;

  // Celebrate the moment THIS day is completed (a tick flips it), but never on
  // simply navigating to an already-finished day.
  const [dayWinKey, setDayWinKey] = useState(0);
  const prevComplete = useRef<{ id: string; complete: boolean }>({
    id: day.id,
    complete: completion.complete,
  });
  useEffect(() => {
    const sameDay = prevComplete.current.id === day.id;
    if (showChecks && sameDay && completion.complete && !prevComplete.current.complete) {
      setDayWinKey((k) => k + 1);
    }
    prevComplete.current = { id: day.id, complete: completion.complete };
  }, [day.id, completion.complete, showChecks]);

  // SG-style day header (kid view): floating emoji + "DAY N • WEEKDAY DATE" + title.
  const dayIndex = (dayNumber ?? 1) - 1;
  const headEmoji = dayEmoji(dayIndex);
  const headTone = dayTone(dayIndex);
  const weekday = day.date
    ? new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long" })
        .format(new Date(`${day.date}T12:00:00`))
        .toUpperCase()
    : "";
  const eyebrow = [dayNumber ? `DAY ${dayNumber}` : null, weekday || null].filter(Boolean).join(" • ");

  return (
    <div className="yc-stack" data-testid="trip-day">
      <header className="yc-stack" style={{ gap: "var(--space-2)" }}>
        {isKid ? (
          <div className="yc-dayhead" data-tone={headTone}>
            <span className="yc-dayhead__emoji" aria-hidden>
              {headEmoji}
            </span>
            {eyebrow ? <span className="yc-dayhead__eyebrow">{eyebrow}</span> : null}
            <h2 className="yc-dayhead__title">{day.label}</h2>
            {day.summary ? <p className="yc-dayhead__sub">{day.summary}</p> : null}
            <style>{`
              .yc-dayhead {
                display: flex; flex-direction: column; align-items: center; gap: var(--space-1);
                padding: var(--space-5) var(--space-4); text-align: center;
                border: var(--border-ink, 2.5px solid #0a4c8b);
                border-radius: var(--radius-2xl, 24px);
                box-shadow: var(--gloss-top);
              }
              .yc-dayhead[data-tone="sky"] { background: var(--sky-50, #eaf6ff); }
              .yc-dayhead[data-tone="sun"] { background: var(--sun-50, #fff6e0); }
              .yc-dayhead[data-tone="aqua"] { background: var(--aqua-50, #e6fafc); }
              .yc-dayhead[data-tone="coral"] { background: var(--coral-50, #ffeee9); }
              .yc-dayhead[data-tone="meadow"] { background: var(--meadow-50, #eafaf0); }
              .yc-dayhead__emoji { font-size: 40px; line-height: 1; animation: yc-dayhead-float 4s ease-in-out infinite; }
              .yc-dayhead__eyebrow {
                font-family: var(--font-display); font-weight: 800;
                font-size: var(--fs-xs, .72rem); letter-spacing: var(--ls-wide, .06em);
                text-transform: uppercase; color: var(--sky-600, #1f7fbf);
              }
              .yc-dayhead__title {
                margin: 0; font-family: var(--font-display); font-weight: 700;
                font-size: var(--fs-h2, 1.6rem); line-height: var(--lh-tight, 1.15);
                color: var(--royal-700, #0a4c8b);
              }
              .yc-dayhead__sub { margin: 0; color: var(--text-muted, #5b6b7b); font-weight: 600; }
              @keyframes yc-dayhead-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
              @media (prefers-reduced-motion: reduce){ .yc-dayhead__emoji{animation:none} }
            `}</style>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <Badge tone="sun">{day.label}</Badge>
              {day.hotel && (day.hotel.name || day.hotel.phase) ? (
                <Badge tone="ink">
                  {[day.hotel.name, day.hotel.phase].filter(Boolean).join(" - ")}
                </Badge>
              ) : null}
            </div>
            {day.summary ? (
              <p style={{ margin: 0, color: "var(--text-body)" }}>{day.summary}</p>
            ) : null}
          </>
        )}

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

        {day.weather &&
        (day.weather.summary || day.weather.high != null || day.weather.low != null) ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
            {[
              day.weather.summary,
              day.weather.high != null || day.weather.low != null
                ? `${day.weather.high != null ? `High ${day.weather.high}C` : ""}${
                    day.weather.high != null && day.weather.low != null ? " / " : ""
                  }${day.weather.low != null ? `Low ${day.weather.low}C` : ""}`
                : null,
            ]
              .filter(Boolean)
              .join(" - ")}
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
              const scene = activityScene(activity.id, copy.title);
              return (
                <Card key={activity.id} variant="soft">
                  {isKid ? (
                    <CardMedia
                      height={88}
                      aria-hidden
                      style={{ background: scene.gradient, display: "grid", placeItems: "center" }}
                    >
                      <span style={{ fontSize: 42, filter: "drop-shadow(0 2px 4px rgba(10,30,60,.18))" }}>
                        {scene.emoji}
                      </span>
                    </CardMedia>
                  ) : null}
                  <CardBody title={copy.title}>
                    {copy.body ? <p style={{ margin: 0 }}>{copy.body}</p> : null}

                    {/* Allergy-aware meal card (shown in both views). */}
                    {activity.meal ? <MealCardView meal={activity.meal} /> : null}

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

                    {/* Bonus deep-dive fact - Big Explorer (explorer_plus) only. */}
                    {isKid && showsBonus(mode) && copy.fact ? (
                      <p style={{ margin: 0, color: "var(--sky-700)", fontWeight: 700 }}>
                        Did you know? {copy.fact}
                      </p>
                    ) : null}

                    {/* Read-aloud: name + body + facts, never the answer. */}
                    {isKid ? (
                      <ReadAloud
                        text={[copy.title, copy.body, ...(activity.facts ?? []), copy.fact]
                          .filter(Boolean)
                          .join(". ")}
                      />
                    ) : null}

                    {/* Typed challenge - kid view, hidden in little mode, and
                        suppressed when the parent turns quizzes off for this explorer. */}
                    {isKid && quizzes && showsChallenge(mode) && activity.challenge ? (
                      <ChallengeBlock challenge={activity.challenge} />
                    ) : null}

                    {/* Bonus quiz - Big Explorer (explorer_plus) only. */}
                    {isKid && quizzes && showsBonus(mode) && copy.quiz ? (
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

                    {/* The single completion primitive: one done-check per activity. */}
                    {showChecks ? (
                      <label
                        data-testid="done-check"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-3)",
                          minHeight: 54,
                          marginTop: "var(--space-2)",
                          padding: "0 var(--space-3)",
                          borderRadius: "var(--radius-md)",
                          background: doneSet.has(activity.id)
                            ? "var(--sun-50)"
                            : "var(--surface-sunk)",
                          border: doneSet.has(activity.id)
                            ? "2.5px solid var(--sun-300)"
                            : "2.5px solid var(--sand-200)",
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          color: "var(--royal-700)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={doneSet.has(activity.id)}
                          onChange={(e) => onToggleActivity?.(activity.id, e.target.checked)}
                          style={{ width: 26, height: 26, accentColor: "var(--sun-400)" }}
                        />
                        <span>{doneSet.has(activity.id) ? "Done!" : "Mark as done"}</span>
                      </label>
                    ) : null}

                    {/* Reward sticker bounces in once the activity is done. */}
                    {showChecks && doneSet.has(activity.id) ? (
                      <div className="yc-sticker" data-testid="reward-sticker">
                        <span className="yc-sticker-emoji" aria-hidden>
                          {rewardFor(activity.id)}
                        </span>
                        Activity complete!
                      </div>
                    ) : null}
                  </CardBody>
                </Card>
              );
            })}
          </section>
        );
      })}

      {showChecks && completion.complete ? (
        <div
          data-testid="day-complete"
          style={{
            padding: "var(--space-4)",
            textAlign: "center",
            background: "var(--grad-sunset)",
            border: "var(--border-ink)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--pop-sun), var(--gloss-top)",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            color: "var(--royal-800)",
          }}
        >
          Day complete! Amazing exploring.
        </div>
      ) : null}
      <Celebrate fireKey={dayWinKey} />
    </div>
  );
}
