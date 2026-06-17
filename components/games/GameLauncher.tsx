"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimStar } from "@/lib/api/stars";
import { hasClaimed } from "@/lib/stars";
import type { ChildProfile, StarsResponse, TripDay } from "@/lib/contract-mock/types";
import { Button } from "@/components/ds";
import { GameOverlay } from "@/components/games/GameOverlay";

/** Launches the active day's mini-game; a win grants a star (source = game). */
export function GameLauncher({
  tripId,
  profile,
  day,
}: {
  tripId: string;
  profile: ChildProfile;
  day: TripDay;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const starsKey = ["stars", tripId, profile.id] as const;

  const claim = useMutation({
    mutationFn: () =>
      claimStar(tripId, { profile_id: profile.id, source: "game", day: day.id }),
    // Invalidate the trip's whole stars prefix so the family Star Bank on Home
    // refreshes too, not just this child's per-day bank.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stars", tripId] }),
  });

  if (!day.game) return null;

  const stars = queryClient.getQueryData<StarsResponse>(starsKey);
  const completed = hasClaimed(stars, profile.id, day.id, "game");

  return (
    <>
      <Button
        variant={completed ? "secondary" : "cta"}
        onClick={() => setOpen(true)}
        data-testid="game-launch"
      >
        {completed ? "Played! Play again" : "Let's play!"}
      </Button>
      {open ? (
        <GameOverlay
          game={day.game}
          onWin={() => claim.mutate()}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
