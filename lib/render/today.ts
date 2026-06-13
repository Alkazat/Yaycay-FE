/**
 * "Today" resolution for the trip view. The day rail highlights today and the
 * view lands on it during the trip. Dates are compared as YYYY-MM-DD in the
 * trip's own timezone so a family in Singapore sees the right day regardless of
 * the device clock.
 */

/** Current date as YYYY-MM-DD in the given IANA timezone (device tz fallback). */
export function todayKeyInTz(timezone?: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, ...opts }).format(new Date());
  } catch {
    // Invalid/unknown timezone - fall back to the device's local date.
    return new Intl.DateTimeFormat("en-CA", opts).format(new Date());
  }
}

/** True when a day's date is "today" in the trip timezone. */
export function isToday(dayDate: string | undefined, timezone?: string): boolean {
  return !!dayDate && dayDate.slice(0, 10) === todayKeyInTz(timezone);
}

/** Id of the day happening today, or null when the trip isn't on right now. */
export function todayDayId(
  days: readonly { id: string; date: string }[],
  timezone?: string,
): string | null {
  const key = todayKeyInTz(timezone);
  return days.find((d) => (d.date ?? "").slice(0, 10) === key)?.id ?? null;
}
