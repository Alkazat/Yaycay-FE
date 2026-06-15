"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeatureOverrides, TripFeatureKey } from "@/lib/features";

/** A trip is either being explored (default) or planned. */
export type TripMode = "explore" | "plan";

interface Persisted {
  mode?: TripMode;
  /** Per-child feature overrides, keyed by profile id. */
  overrides?: Record<string, FeatureOverrides>;
}

function storageKey(tripId: string): string {
  return `yaycay.trip.${tripId}.planning`;
}

/**
 * Local-first planning state for a trip: the Explore/Plan mode and the parent's
 * per-explorer feature overrides. Persisted to localStorage (a parent-device
 * preference for how the trip presents), so it survives reloads without a server
 * round-trip. Swapping to a BE-backed store later is a change to this hook only;
 * the rest of the app reads through `resolveFeatures`.
 */
export function useTripPlanning(tripId: string) {
  const [state, setState] = useState<Persisted>({});

  // Restore on mount (client only - keeps SSR markup stable).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(tripId));
      if (raw) setState(JSON.parse(raw) as Persisted);
    } catch {
      // localStorage unavailable / malformed - fall back to in-memory defaults.
    }
  }, [tripId]);

  const persist = useCallback(
    (next: Persisted) => {
      setState(next);
      try {
        window.localStorage.setItem(storageKey(tripId), JSON.stringify(next));
      } catch {
        // ignore persistence failures (private mode etc.)
      }
    },
    [tripId],
  );

  const setMode = useCallback((mode: TripMode) => persist({ ...state, mode }), [persist, state]);

  const setOverride = useCallback(
    (profileId: string, key: TripFeatureKey, value: boolean) => {
      const overrides = { ...(state.overrides ?? {}) };
      overrides[profileId] = { ...(overrides[profileId] ?? {}), [key]: value };
      persist({ ...state, overrides });
    },
    [persist, state],
  );

  const resetProfile = useCallback(
    (profileId: string) => {
      const overrides = { ...(state.overrides ?? {}) };
      delete overrides[profileId];
      persist({ ...state, overrides });
    },
    [persist, state],
  );

  const overridesFor = useCallback(
    (profileId: string): FeatureOverrides => state.overrides?.[profileId] ?? {},
    [state.overrides],
  );

  return {
    mode: state.mode ?? "explore",
    setMode,
    overridesFor,
    setOverride,
    resetProfile,
  };
}
