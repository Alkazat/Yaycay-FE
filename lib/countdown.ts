/**
 * Countdown to the start of the holiday.
 *
 * The countdown is pure FE math over BE-saved values: the trip's `start_date`
 * and IANA `timezone`. There is no separate offer/expiry field - we count down
 * to the moment the holiday begins, in the destination's local time.
 *
 * The brand counts in "sleeps" (whole nights to go), per the design system
 * voice ("12 sleeps to go").
 */

export interface Countdown {
  /** Whole milliseconds remaining (never negative). */
  ms: number;
  /** Whole "sleeps" (nights) to go. */
  sleeps: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the start moment has passed - "the adventure has begun". */
  started: boolean;
}

/**
 * Resolve a `YYYY-MM-DD` (or full ISO) start date in a given IANA timezone to a
 * UTC epoch in ms. A bare date is treated as local midnight in that timezone.
 */
export function resolveStartEpochMs(startDate: string, timezone: string): number {
  // Full ISO with an explicit time/zone: trust it directly.
  if (startDate.includes("T")) {
    const t = Date.parse(startDate);
    if (!Number.isNaN(t)) return t;
  }

  const [y, m, d] = startDate.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) {
    const fallback = Date.parse(startDate);
    return Number.isNaN(fallback) ? Date.now() : fallback;
  }

  // Midnight on that calendar date, interpreted in `timezone`. We find the UTC
  // instant whose local wall-clock in `timezone` is 00:00 on the given date by
  // measuring the zone's offset at that moment.
  const utcGuess = Date.UTC(y, m - 1, d, 0, 0, 0);
  const offsetMin = timezoneOffsetMinutes(timezone, utcGuess);
  return utcGuess - offsetMin * 60_000;
}

/**
 * Offset (minutes east of UTC) of `timezone` at instant `epochMs`.
 * Uses Intl; falls back to 0 (UTC) if the zone is unknown.
 */
function timezoneOffsetMinutes(timezone: string, epochMs: number): number {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(new Date(epochMs));
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    const asUTC = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
    );
    return Math.round((asUTC - epochMs) / 60_000);
  } catch {
    return 0;
  }
}

/** Compute the live countdown from `now` to the holiday start. */
export function computeCountdown(
  startDate: string,
  timezone: string,
  now: number = Date.now(),
): Countdown {
  const start = resolveStartEpochMs(startDate, timezone);
  const ms = Math.max(0, start - now);
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  // "Sleeps" rounds up the partial first night: any time today still counts as
  // a sleep until you wake on departure day.
  const sleeps = Math.ceil(ms / 86_400_000);

  return {
    ms,
    sleeps,
    days,
    hours,
    minutes,
    seconds,
    started: ms === 0,
  };
}
