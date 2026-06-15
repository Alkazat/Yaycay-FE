"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeatures, putFeatures } from "@/lib/api/features";
import type { FeatureOverrides, TripFeatureKey } from "@/lib/features";

type OverridesByProfile = Record<string, FeatureOverrides>;

/**
 * BE-backed per-explorer feature overrides for a trip (`/trips/:id/features`).
 * Reads through React Query and writes optimistically so a toggle feels instant;
 * unlike the old device-local store, these sync across the parent's devices.
 * Feature RESOLUTION (preset + override) still lives in `lib/features`.
 */
export function useTripFeatures(tripId: string) {
  const queryClient = useQueryClient();
  const key = ["features", tripId] as const;

  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getFeatures(tripId, signal),
  });
  const byProfile: OverridesByProfile = query.data ?? {};

  const mutation = useMutation({
    mutationFn: ({ profileId, overrides }: { profileId: string; overrides: FeatureOverrides }) =>
      putFeatures(tripId, profileId, overrides),
    onMutate: async ({ profileId, overrides }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<OverridesByProfile>(key);
      queryClient.setQueryData<OverridesByProfile>(key, {
        ...(prev ?? {}),
        [profileId]: overrides,
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(key, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const overridesFor = (profileId: string): FeatureOverrides => byProfile[profileId] ?? {};

  const setOverride = (profileId: string, featureKey: TripFeatureKey, value: boolean) => {
    mutation.mutate({ profileId, overrides: { ...overridesFor(profileId), [featureKey]: value } });
  };

  const resetProfile = (profileId: string) => {
    mutation.mutate({ profileId, overrides: {} });
  };

  return { overridesFor, setOverride, resetProfile };
}
