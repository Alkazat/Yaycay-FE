"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStars, claimStar } from "@/lib/api/stars";
import { sgdValue, hasClaimed, balanceFor, STAR_CURRENCY } from "@/lib/stars";
import type { ChildProfile, StarSource, TripDay } from "@/lib/contract-mock/types";
import { Card, CardBody, Button, Badge } from "@/components/ds";
import { Celebrate } from "@/components/ui/Celebrate";

interface StarBankProps {
  tripId: string;
  profile: ChildProfile;
  day: TripDay;
}

/** Per-child star bank + the day's claimable star challenge (B1 + B3). */
export function StarBank({ tripId, profile, day }: StarBankProps) {
  const queryClient = useQueryClient();
  const starsKey = ["stars", tripId, profile.id] as const;
  const starsQuery = useQuery({
    queryKey: starsKey,
    queryFn: ({ signal }) => getStars(tripId, profile.id, signal),
  });
  const stars = starsQuery.data;

  const [celebrateKey, setCelebrateKey] = useState(0);
  const claim = useMutation({
    mutationFn: (source: StarSource) =>
      claimStar(tripId, { profile_id: profile.id, source, day: day.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: starsKey });
      setCelebrateKey((k) => k + 1);
    },
  });

  const [revealed, setRevealed] = useState(false);
  const challenge = day.star_challenge;
  const claimedChallenge = hasClaimed(stars, profile.id, day.id, "challenge");
  const count = balanceFor(stars, profile.id);

  return (
    <>
      <Card>
        <CardBody title={`${profile.name}'s star bank`}>
          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Badge tone="sun" data-testid="star-count">
              {count} {count === 1 ? "star" : "stars"}
            </Badge>
            <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
              {sgdValue(count)} {STAR_CURRENCY} of holiday spending money
            </span>
          </div>

          {challenge ? (
            <div
              data-testid="star-challenge"
              style={{
                marginTop: "var(--space-2)",
                padding: "var(--space-3)",
                background: "var(--surface-sunk)",
                border: "2.5px solid var(--sun-300)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
            >
              <strong>Today&apos;s challenge</strong>
              <p style={{ margin: 0, fontWeight: 700 }}>{challenge.question}</p>
              {revealed ? (
                <p style={{ margin: 0, color: "var(--royal-700)" }}>{challenge.answer}</p>
              ) : null}

              {!revealed ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRevealed(true)}
                  style={{ alignSelf: "flex-start" }}
                >
                  Show the answer
                </Button>
              ) : claimedChallenge ? (
                <Badge tone="meadow">Already claimed!</Badge>
              ) : (
                <Button
                  variant="cta"
                  size="sm"
                  onClick={() => claim.mutate("challenge")}
                  disabled={claim.isPending}
                  style={{ alignSelf: "flex-start" }}
                >
                  {claim.isPending ? "Claiming..." : "Claim my star!"}
                </Button>
              )}
            </div>
          ) : null}
        </CardBody>
      </Card>
      <Celebrate fireKey={celebrateKey} />
    </>
  );
}
