/**
 * Builders for the manual trip-edit ops the planner sends to
 * `PATCH /trips/:id/content` (the same `PatchOp` vocabulary the AI harness and
 * the MCP `edit_itinerary` tool use). Kept pure so the shapes are unit-testable;
 * the BE re-validates and persists, and may reassign the client-minted ids.
 */
import type { Moment, PatchOp, TripDay } from "@/lib/contract-mock/types";

/** A reasonably unique client id for a new item (the BE may replace it). */
export function newId(prefix: string): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rnd}`;
}

/** Add a new, empty day to the itinerary. */
export function addDayOp(label: string, date?: string): PatchOp {
  const day: TripDay = { id: newId("day"), date: date ?? "", label, moments: [] };
  return { op: "add_day", day };
}

/** Add a new, empty moment to a day. */
export function addMomentOp(dayId: string, slot: Moment["slot"], title: string): PatchOp {
  const moment: Moment = { id: newId("mom"), slot, title, activities: [] };
  return { op: "add_moment", day_id: dayId, moment };
}

/** Set / replace a day's summary line. */
export function setDaySummaryOp(dayId: string, summary: string): PatchOp {
  return { op: "set_day_summary", day_id: dayId, summary };
}

/** The slots a moment can sit in (kept in sync with the renderer's labels). */
export const MOMENT_SLOTS: Moment["slot"][] = ["morning", "afternoon", "evening", "anytime"];
