import type { TripContent, TripDay } from "@/lib/contract-mock/types";

/**
 * Derived progress. Progress is computed from ticking real activities (keyed by
 * stable activity id), never stored separately - the prototype's "mark day done"
 * control was deliberately retired. Pure and unit-tested.
 */

export interface DayCompletion {
  ticked: number;
  total: number;
  complete: boolean;
  /** 0-100. */
  pct: number;
}

/** Count tickable activities on a day and how many are done. */
export function dayCompletion(day: TripDay, done: ReadonlySet<string>): DayCompletion {
  const ids = day.moments.flatMap((m) => m.activities.map((a) => a.id));
  const total = ids.length;
  const ticked = ids.filter((id) => done.has(id)).length;
  return {
    ticked,
    total,
    complete: total > 0 && ticked === total,
    pct: total === 0 ? 0 : Math.round((ticked / total) * 100),
  };
}

export interface TripProgress {
  daysComplete: number;
  totalDays: number;
  pct: number;
}

/** A day counts as explored once all its activities are ticked. */
export function tripProgress(trip: TripContent, done: ReadonlySet<string>): TripProgress {
  const totalDays = trip.days.length;
  const daysComplete = trip.days.filter((d) => dayCompletion(d, done).complete).length;
  return {
    daysComplete,
    totalDays,
    pct: totalDays === 0 ? 0 : Math.round((daysComplete / totalDays) * 100),
  };
}
