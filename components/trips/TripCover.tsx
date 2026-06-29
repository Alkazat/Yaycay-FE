"use client";

import type { ChildProfile, ExplorerMode } from "@/lib/contract-mock/types";
import { Countdown } from "@/components/Countdown";
import { isChild, isParentCarer, modeForProfile } from "@/lib/profile/access";
import { resolvedAge } from "@/lib/age";

/**
 * The warm "Who's exploring?" entry to a trip's Exploring experience - emulating
 * the gold-standard cover: a family title, a tap-your-name picker, the trip dates
 * and a live countdown. Picking a name IS the profile selection; it hands off to
 * {@link TripView}, which then opens the day-by-day "book".
 *
 * Shown only on a fresh entry (no explorer chosen yet); a returning explorer skips
 * straight to the book. Presentation-only: every value comes from existing trip +
 * profile data, no invented fields.
 */

interface TripCoverProps {
  destination: string;
  startDate?: string;
  endDate?: string;
  timezone?: string;
  profiles: ChildProfile[];
  onPick: (id: string) => void;
}

/** A warm colour family per band, echoing the gold standard (Savy gold, Tay coral,
 * Lenny sky). Pure presentation - the contract carries no per-profile colour. */
const TONE_BY_MODE: Record<ExplorerMode, string> = {
  explorer_plus: "sun",
  explorer: "coral",
  little: "sky",
  standard: "aqua",
};

function initial(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}

function formatRange(start?: string, end?: string): string | null {
  if (!start) return null;
  // Date-only strings: anchor at local noon so the displayed day never slips a tz.
  const at = (d: string) => new Date(`${d}T12:00:00`);
  const dm = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" });
  const y = new Intl.DateTimeFormat("en-AU", { year: "numeric" });
  const s = at(start);
  if (!end) return `${dm.format(s)} ${y.format(s)}`;
  const e = at(end);
  return `${dm.format(s)} – ${dm.format(e)} ${y.format(e)}`;
}

export function TripCover({
  destination,
  startDate,
  endDate,
  timezone,
  profiles,
  onPick,
}: TripCoverProps) {
  const children = profiles.filter((p) => isChild(p));
  const guides = profiles.filter((p) => isParentCarer(p));
  const guideNames = guides.map((g) => g.name).join(" & ");
  const range = formatRange(startDate, endDate);

  return (
    <section className="yc-cover" data-testid="trip-cover" aria-label={`Start exploring ${destination}`}>
      <div className="yc-cover__emblem" aria-hidden="true">
        🌏
      </div>

      <h1 className="yc-cover__title">
        Our <span className="yc-cover__title-accent">{destination}</span> Adventure!
      </h1>

      <div className="yc-cover__card">
        <p className="yc-cover__lead">
          Tap your name to start! <span aria-hidden="true">👇</span>
        </p>

        <div className="yc-cover__people" role="group" aria-label="Choose your explorer">
          {children.map((p) => {
            const tone = TONE_BY_MODE[modeForProfile(p)] ?? "sky";
            // Prefer DOB-computed age relative to the trip start; fall back to stored age.
            const displayAge = resolvedAge(
              (p as ChildProfile & { date_of_birth?: string | null }).date_of_birth,
              p.age,
              startDate,
            );
            return (
              <button
                key={p.id}
                type="button"
                className="yc-cover__person"
                data-tone={tone}
                onClick={() => onPick(p.id)}
              >
                <span className="yc-cover__avatar" aria-hidden="true">
                  {p.avatar ?? initial(p.name)}
                </span>
                <span className="yc-cover__name">{p.name}</span>
                {displayAge !== null ? (
                  <span className="yc-cover__age">Age {displayAge}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {guides.length > 0 ? (
          <>
            <div className="yc-cover__divider" aria-hidden="true" />
            <button
              type="button"
              className="yc-cover__guides"
              onClick={() => onPick(guides[0].id)}
            >
              <span aria-hidden="true">☕</span> {guideNames || "Grown-ups"} (the guides!)
            </button>
          </>
        ) : null}
      </div>

      {range ? (
        <div className="yc-cover__dates">
          <span aria-hidden="true">📅</span> {range}
        </div>
      ) : null}

      {startDate && timezone ? (
        <div className="yc-cover__countdown">
          <Countdown startDate={startDate} timezone={timezone} />
        </div>
      ) : null}

      <style>{`
        .yc-cover {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-5);
          padding: var(--space-8) var(--space-5) calc(var(--space-10) + env(safe-area-inset-bottom));
          text-align: center;
          background:
            radial-gradient(120% 80% at 50% 0%, var(--sky-50) 0%, transparent 60%),
            radial-gradient(120% 80% at 50% 100%, var(--sun-50, #fff6e0) 0%, transparent 55%),
            var(--surface-page, var(--cream-100, #fbf7ec));
          animation: yc-cover-in var(--dur-md, .35s) var(--ease-bounce, ease) both;
        }
        .yc-cover__emblem {
          width: 96px; height: 96px;
          display: grid; place-items: center;
          font-size: 48px;
          border-radius: var(--radius-blob, 42% 58% 57% 43% / 43% 47% 53% 57%);
          background: var(--grad-sky, linear-gradient(135deg, var(--sky-200), var(--aqua-200)));
          box-shadow: var(--pop-sky), var(--gloss-top);
          animation: yc-cover-float 4s var(--ease-bounce, ease-in-out) infinite;
        }
        .yc-cover__title {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: var(--fs-h1, 2rem);
          line-height: var(--lh-tight, 1.1);
          color: var(--royal-700, #0a4c8b);
          max-width: 14ch;
        }
        .yc-cover__title-accent { color: var(--sky-500, #2a96d8); }
        .yc-cover__card {
          width: 100%;
          max-width: 26rem;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-6) var(--space-5);
          background: var(--surface-card, #fff);
          border: var(--border-ink, 2.5px solid #0a4c8b);
          border-radius: var(--radius-2xl, 24px);
          box-shadow: var(--card-lift, 0 12px 28px rgba(10,76,139,.14)), var(--gloss-top);
        }
        .yc-cover__lead {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--fs-sm, .9rem);
          letter-spacing: var(--ls-wide, .04em);
          text-transform: uppercase;
          color: var(--coral-500, #ff6f4d);
        }
        .yc-cover__people {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: var(--space-3);
        }
        .yc-cover__person {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          min-width: 64px;
          padding: var(--space-1);
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: var(--font-display);
          border-radius: var(--radius-lg, 16px);
          transition: transform var(--dur-sm, .15s) var(--ease-bounce, ease);
        }
        .yc-cover__person:hover { transform: translateY(-3px); }
        .yc-cover__person:active { transform: scale(.94); }
        .yc-cover__avatar {
          width: 72px; height: 72px;
          display: grid; place-items: center;
          font-size: 30px; font-weight: 700;
          color: var(--royal-700, #0a4c8b);
          border-radius: var(--radius-pill, 999px);
          border: var(--border-ink, 2.5px solid #0a4c8b);
          box-shadow: var(--gloss-top);
        }
        .yc-cover__person[data-tone="sun"] .yc-cover__avatar { background: var(--sun-200, #ffd66b); box-shadow: var(--pop-sun), var(--gloss-top); }
        .yc-cover__person[data-tone="coral"] .yc-cover__avatar { background: var(--coral-200, #ffb3a1); box-shadow: var(--pop-coral), var(--gloss-top); }
        .yc-cover__person[data-tone="sky"] .yc-cover__avatar { background: var(--sky-200, #aadcff); box-shadow: var(--pop-sky), var(--gloss-top); }
        .yc-cover__person[data-tone="aqua"] .yc-cover__avatar { background: var(--aqua-200, #a9ecf2); box-shadow: var(--pop-aqua), var(--gloss-top); }
        .yc-cover__name {
          font-weight: 700;
          font-size: var(--fs-md, 1rem);
          color: var(--text-strong, var(--royal-700, #0a4c8b));
        }
        .yc-cover__age {
          font-size: var(--fs-xs, .75rem);
          color: var(--text-muted, #5b6b7b);
          font-weight: 600;
        }
        .yc-cover__divider {
          height: 2px;
          width: 80%;
          align-self: center;
          background: var(--line-soft, var(--sand-200, #ece3d2));
          border-radius: var(--radius-pill, 999px);
        }
        .yc-cover__guides {
          align-self: center;
          min-height: var(--control-md, 44px);
          padding: var(--space-2) var(--space-5);
          border: 2.5px solid var(--sand-300, #ddd0b8);
          background: var(--surface-card, #fff);
          border-radius: var(--radius-pill, 999px);
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--fs-sm, .9rem);
          color: var(--royal-700, #0a4c8b);
          transition: transform var(--dur-sm, .15s) var(--ease-bounce, ease);
        }
        .yc-cover__guides:hover { transform: translateY(-2px); }
        .yc-cover__guides:active { transform: scale(.97); }
        .yc-cover__dates {
          display: inline-flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--surface-card, #fff);
          border: 2.5px solid var(--sand-300, #ddd0b8);
          border-radius: var(--radius-pill, 999px);
          font-family: var(--font-display); font-weight: 600;
          color: var(--royal-700, #0a4c8b);
        }
        @keyframes yc-cover-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes yc-cover-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .yc-cover, .yc-cover__emblem { animation: none; }
          .yc-cover__person, .yc-cover__guides { transition: none; }
        }
      `}</style>
    </section>
  );
}
