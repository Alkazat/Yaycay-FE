import type { TripSummary } from "@/lib/contract-mock/types";
import type { SessionPhase } from "@/lib/sessionHint";

/**
 * Coarse trip phase for the cross-app hint cookie: "travelling" when a trip
 * spans today (date-only), otherwise "planning". A day's granularity is plenty
 * for a CTA label, so we compare YYYY-MM-DD strings and don't fuss over
 * timezones.
 */
export function phaseFromTrips(
  trips: ReadonlyArray<Pick<TripSummary, "start_date" | "end_date">>,
  now: Date = new Date(),
): SessionPhase {
  const today = now.toISOString().slice(0, 10);
  const travelling = trips.some(
    (t) => !!t.start_date && !!t.end_date && t.start_date <= today && today <= t.end_date,
  );
  return travelling ? "travelling" : "planning";
}
