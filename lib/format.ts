/**
 * Human date formatting. The brand never shows a cold ISO string in UI
 * ("Sat 12 Jul", not "2026-07-12"). Bare YYYY-MM-DD dates are read as
 * calendar dates (UTC) so they never slip a day across timezones.
 */
export function formatHumanDate(input: string): string {
  const date = input.includes("T") ? new Date(input) : new Date(`${input}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

/** A short range like "Fri 26 - Sun 28 Jun". */
export function formatDateRange(start: string, end: string): string {
  return `${formatHumanDate(start)} - ${formatHumanDate(end)}`;
}
