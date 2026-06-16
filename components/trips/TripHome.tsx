"use client";

import type { ChildProfile, TripDay } from "@/lib/contract-mock/types";
import { Button } from "@/components/ds";
import { FamilyStarBank } from "@/components/stars/FamilyStarBank";
import { dayCompletion } from "@/lib/render/progress";
import { dayEmoji, dayTone } from "@/components/trips/dayDecor";

/**
 * The book's Home / overview - where the cover hands you off. Emulates the gold
 * standard's home page: the explorer's Star Bank, a tappable day-card grid with
 * completion, and the trip's overall progress. Tapping a day opens its page.
 *
 * Presentation-only; every value comes from existing trip + progress data.
 */

function fmtDate(d: string): string {
  return new Intl.DateTimeFormat("en-AU", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(`${d}T12:00:00`),
  );
}

interface TripHomeProps {
  tripId: string;
  days: TripDay[];
  profile: ChildProfile | null;
  kids: ChildProfile[];
  showPocketMoney: boolean;
  doneSet: Set<string>;
  daysComplete: number;
  totalDays: number;
  todayId: string | null;
  onSelectDay: (id: string) => void;
  onJumpToday?: () => void;
}

export function TripHome({
  tripId,
  days,
  profile,
  kids,
  showPocketMoney,
  doneSet,
  daysComplete,
  totalDays,
  todayId,
  onSelectDay,
  onJumpToday,
}: TripHomeProps) {
  const pct = totalDays > 0 ? Math.round((daysComplete / totalDays) * 100) : 0;

  return (
    <div className="yc-home yc-stack" data-testid="trip-home">
      <header className="yc-home__head">
        <h2 className="yc-home__title">
          {profile ? `${profile.name}'s adventure` : "Your adventure"}
        </h2>
        <p className="yc-home__sub">
          Tap a day to explore — tick things off as you go <span aria-hidden="true">📖</span>
        </p>
      </header>

      {onJumpToday ? (
        <Button variant="cta" onClick={onJumpToday} style={{ alignSelf: "flex-start" }}>
          ⭐ Jump to today
        </Button>
      ) : null}

      {showPocketMoney && kids.length > 0 ? (
        <FamilyStarBank tripId={tripId} kids={kids} activeId={profile?.id ?? null} />
      ) : null}

      <div className="yc-home__progress" aria-label={`${daysComplete} of ${totalDays} days explored`}>
        <div className="yc-home__progress-row">
          <strong>{daysComplete}/{totalDays} days explored</strong>
          <span>{pct}%</span>
        </div>
        <div className="yc-home__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <span className="yc-home__bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="yc-home__grid" aria-label="Trip days">
        {days.map((d, i) => {
          const c = dayCompletion(d, doneSet);
          const tone = dayTone(i);
          const emoji = dayEmoji(i);
          const isToday = d.id === todayId;
          return (
            <button
              key={d.id}
              type="button"
              className="yc-home__day"
              data-tone={tone}
              data-complete={c.complete ? "true" : undefined}
              onClick={() => onSelectDay(d.id)}
            >
              <span className="yc-home__day-top">
                <span className="yc-home__day-emoji" aria-hidden="true">{emoji}</span>
                {c.complete ? (
                  <span className="yc-home__day-check" aria-label="Completed">✓</span>
                ) : isToday ? (
                  <span className="yc-home__day-today">Today</span>
                ) : null}
              </span>
              <span className="yc-home__day-n">Day {i + 1}</span>
              <span className="yc-home__day-label">{d.label}</span>
              <span className="yc-home__day-date">{fmtDate(d.date)}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .yc-home__head { text-align: center; }
        .yc-home__title {
          margin: 0;
          font-family: var(--font-display); font-weight: 700;
          font-size: var(--fs-h2, 1.6rem); color: var(--royal-700, #0a4c8b);
        }
        .yc-home__sub { margin: var(--space-1) 0 0; color: var(--text-muted, #5b6b7b); font-weight: 600; }
        .yc-home__progress {
          background: var(--surface-card, #fff);
          border: var(--border-ink, 2.5px solid #0a4c8b);
          border-radius: var(--radius-xl, 20px);
          padding: var(--space-3) var(--space-4);
          box-shadow: var(--gloss-top);
        }
        .yc-home__progress-row {
          display: flex; justify-content: space-between; align-items: baseline;
          font-family: var(--font-display); color: var(--royal-700, #0a4c8b);
          margin-bottom: var(--space-2);
        }
        .yc-home__bar {
          height: 12px; border-radius: var(--radius-pill, 999px);
          background: var(--sand-200, #ece3d2); overflow: hidden;
        }
        .yc-home__bar-fill {
          display: block; height: 100%;
          background: var(--grad-sky, linear-gradient(90deg, var(--sky-400), var(--aqua-400)));
          border-radius: var(--radius-pill, 999px);
          transition: width var(--dur-md, .35s) var(--ease-bounce, ease);
        }
        .yc-home__grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);
        }
        .yc-home__day {
          display: flex; flex-direction: column; gap: 2px;
          min-height: 110px; padding: var(--space-3);
          text-align: left; cursor: pointer;
          border: var(--border-ink, 2.5px solid #0a4c8b);
          border-radius: var(--radius-xl, 20px);
          background: var(--surface-card, #fff);
          box-shadow: var(--gloss-top);
          font-family: var(--font-body);
          transition: transform var(--dur-sm, .15s) var(--ease-bounce, ease);
        }
        .yc-home__day:hover { transform: translateY(-3px); }
        .yc-home__day:active { transform: scale(.97); }
        .yc-home__day[data-tone="sky"] { box-shadow: var(--pop-sky), var(--gloss-top); }
        .yc-home__day[data-tone="sun"] { box-shadow: var(--pop-sun), var(--gloss-top); }
        .yc-home__day[data-tone="aqua"] { box-shadow: var(--pop-aqua), var(--gloss-top); }
        .yc-home__day[data-tone="coral"] { box-shadow: var(--pop-coral), var(--gloss-top); }
        .yc-home__day[data-tone="meadow"] { box-shadow: var(--pop-sky), var(--gloss-top); }
        .yc-home__day[data-complete="true"] { background: var(--meadow-50, #eafaf0); }
        .yc-home__day-top { display: flex; justify-content: space-between; align-items: center; }
        .yc-home__day-emoji { font-size: 28px; }
        .yc-home__day-check {
          display: grid; place-items: center; width: 26px; height: 26px;
          border-radius: var(--radius-pill, 999px);
          background: var(--meadow-400, #46c97e); color: #fff; font-weight: 800;
        }
        .yc-home__day-today {
          font-size: var(--fs-xs, .72rem); font-weight: 800; letter-spacing: var(--ls-wide, .04em);
          text-transform: uppercase; color: var(--sun-700, #b5790a);
          background: var(--sun-100, #fff1cc); padding: 2px 8px; border-radius: var(--radius-pill, 999px);
        }
        .yc-home__day-n {
          font-family: var(--font-display); font-weight: 700; font-size: var(--fs-sm, .85rem);
          color: var(--sky-600, #1f7fbf); letter-spacing: var(--ls-wide, .03em);
        }
        .yc-home__day-label {
          font-family: var(--font-display); font-weight: 700; font-size: var(--fs-md, 1rem);
          color: var(--text-strong, var(--royal-700, #0a4c8b)); line-height: var(--lh-tight, 1.15);
        }
        .yc-home__day-date { font-size: var(--fs-xs, .72rem); color: var(--text-muted, #5b6b7b); font-weight: 600; }
        @media (prefers-reduced-motion: reduce) {
          .yc-home__day, .yc-home__bar-fill { transition: none; }
        }
      `}</style>
    </div>
  );
}
