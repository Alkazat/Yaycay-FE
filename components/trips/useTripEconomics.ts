"use client";

import { useQuery } from "@tanstack/react-query";
import { getTripChallenges } from "@/lib/api/challenges";
import { getTripBudget } from "@/lib/api/budget";
import { getTripCosts } from "@/lib/api/costs";
import { getTripRewards } from "@/lib/api/rewards";

/**
 * Per-child challenges for a trip (`GET /trips/:id/challenges`).
 * Pass `profileId` to scope to a single child's challenges.
 * queryKey: ["challenges", tripId, profileId | undefined]
 */
export function useTripChallenges(tripId: string, profileId?: string) {
  return useQuery({
    queryKey: ["challenges", tripId, profileId] as const,
    queryFn: ({ signal }) => getTripChallenges(tripId, profileId, signal),
  });
}

/**
 * Cash budget and exchange rate for a trip (`GET /trips/:id/budget`).
 * Returns `{ budget: null }` when the trip has no budget configured yet.
 * queryKey: ["budget", tripId]
 */
export function useTripBudget(tripId: string) {
  return useQuery({
    queryKey: ["budget", tripId] as const,
    queryFn: ({ signal }) => getTripBudget(tripId, signal),
  });
}

/**
 * Itemised cost lines for a trip (`GET /trips/:id/costs`).
 * queryKey: ["costs", tripId]
 */
export function useTripCosts(tripId: string) {
  return useQuery({
    queryKey: ["costs", tripId] as const,
    queryFn: ({ signal }) => getTripCosts(tripId, signal),
  });
}

/**
 * Star-to-cash reward configs for a trip (`GET /trips/:id/rewards`).
 * queryKey: ["rewards", tripId]
 */
export function useTripRewards(tripId: string) {
  return useQuery({
    queryKey: ["rewards", tripId] as const,
    queryFn: ({ signal }) => getTripRewards(tripId, signal),
  });
}
