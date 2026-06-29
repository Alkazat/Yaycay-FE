"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTripMembers, addTripMember, removeTripMember } from "@/lib/api/members";
import type { ChildProfile } from "@/lib/contract-mock/types";

/**
 * Per-trip roster (`GET /trips/:id/members`).
 * Returns the trip-scoped list of explorers + grown-ups.
 * queryKey: ["members", tripId]
 *
 * Mirror of useTripEconomics — query + two mutations (add/remove).
 */
export function useTripMembers(tripId: string) {
  const queryClient = useQueryClient();
  const membersKey = ["members", tripId] as const;

  const query = useQuery({
    queryKey: membersKey,
    queryFn: ({ signal }) => getTripMembers(tripId, signal),
  });

  /**
   * Add a profile to the trip roster.
   * Optimistically appends the profile then reconciles on settle.
   */
  const add = useMutation({
    mutationFn: (profileId: string) => addTripMember(tripId, profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: membersKey });
    },
  });

  /**
   * Remove a profile from the trip roster.
   * Optimistically removes then reconciles on settle.
   */
  const remove = useMutation({
    mutationFn: (profileId: string) => removeTripMember(tripId, profileId),
    onMutate: async (profileId) => {
      await queryClient.cancelQueries({ queryKey: membersKey });
      const prev = queryClient.getQueryData<{ members: ChildProfile[] }>(membersKey);
      if (prev) {
        queryClient.setQueryData(membersKey, {
          members: prev.members.filter((m) => m.id !== profileId),
        });
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(membersKey, ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: membersKey }),
  });

  return { query, add, remove };
}
