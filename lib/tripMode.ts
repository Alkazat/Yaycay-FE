import type { TripSummary } from "@/lib/contract-mock/types";

/** A trip card's two actions: explore the days, or plan the trip. */
export type TripMode = "explore" | "plan";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Which action a trip tile leads with. Within 2 days of the start (or during the
 * trip) the family is about to travel, so "Explore" is primary; otherwise there's
 * planning to do, so "Plan" leads. The other action is always offered too.
 */
export function tripPrimaryMode(
  trip: Pick<TripSummary, "start_date" | "end_date">,
  now: number = Date.now(),
): TripMode {
  if (!trip.start_date) return "plan";
  const start = Date.parse(trip.start_date);
  if (Number.isNaN(start)) return "plan";
  const endRaw = trip.end_date ? Date.parse(trip.end_date) : start;
  const end = Number.isNaN(endRaw) ? start : endRaw;
  return now >= start - 2 * DAY && now <= end + DAY ? "explore" : "plan";
}
