"use client";

import { useCallback, useEffect, useState } from "react";

/** A trip is either being explored (default) or planned. */
export type TripMode = "explore" | "plan";

function storageKey(tripId: string): string {
  return `yaycay.trip.${tripId}.mode`;
}

/**
 * The trip's Explore/Plan mode - a transient grown-up UI preference, kept on the
 * device (localStorage) so it survives reloads without a server round-trip. The
 * per-explorer feature toggles, by contrast, are BE-backed (see useTripFeatures).
 */
export function useTripPlanning(tripId: string) {
  const [mode, setModeState] = useState<TripMode>("explore");

  // Restore on mount (client only - keeps SSR markup stable).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey(tripId));
      if (stored === "plan" || stored === "explore") setModeState(stored);
    } catch {
      // localStorage unavailable - fall back to the explore default.
    }
  }, [tripId]);

  const setMode = useCallback(
    (next: TripMode) => {
      setModeState(next);
      try {
        window.localStorage.setItem(storageKey(tripId), next);
      } catch {
        // ignore persistence failures (private mode etc.)
      }
    },
    [tripId],
  );

  return { mode, setMode };
}
