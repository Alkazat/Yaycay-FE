"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStars, claimStar } from "@/lib/api/stars";
import { hasClaimed, balanceFor, STAR_CURRENCY, STAR_VALUE } from "@/lib/stars";
import type { ChildProfile, StarSource, TripDay } from "@/lib/contract-mock/types";
import { Card, CardBody, Button, Badge } from "@/components/ds";
import { Celebrate } from "@/components/ui/Celebrate";
import { useTripRewards, useTripChallenges } from "@/components/trips/useTripEconomics";

interface StarBankProps {
  tripId: string;
  profile: ChildProfile;
  day: TripDay;
}

const KIND_TONE: Record<string, string> = {
  quiz: "var(--sun-400)",
  spot: "var(--sky-400)",
  photo: "var(--coral-400)",
  challenge: "var(--meadow-400)",
};

const KIND_LABEL: Record<string, string> = {
  quiz: "Quiz",
  spot: "Spot it",
  photo: "Photo challenge",
  challenge: "Challenge",
};

/** Per-child star bank + the day's claimable star challenge (B1 + B3). */
export function StarBank({ tripId, profile, day }: StarBankProps) {
  const queryClient = useQueryClient();
  const starsKey = ["stars", tripId, profile.id] as const;
  const starsQuery = useQuery({
    queryKey: starsKey,
    queryFn: ({ signal }) => getStars(tripId, profile.id, signal),
  });
  const stars = starsQuery.data;

  // Reward config: use per-child or trip-default; fall back to hardcoded prototype.
  const rewardsQuery = useTripRewards(tripId);
  const reward =
    rewardsQuery.data?.rewards.find((r) => r.profile_id === profile.id) ??
    rewardsQuery.data?.rewards.find((r) => r.profile_id == null);
  const starValue = reward?.star_value ?? STAR_VALUE;
  const starCurrency = reward?.currency ?? STAR_CURRENCY;

  // Per-child API challenges for the active day.
  const challengesQuery = useTripChallenges(tripId, profile.id);
  const apiChallengesForDay = (challengesQuery.data?.challenges ?? []).filter(
    (c) => c.day === day.id,
  );

  const [celebrateKey, setCelebrateKey] = useState(0);
  const claim = useMutation({
    mutationFn: (source: StarSource) =>
      claimStar(tripId, { profile_id: profile.id, source, day: day.id }),
    onSuccess: () => {
      // Invalidate the trip's whole stars prefix so the per-day bank AND the
      // family Star Bank on Home both refresh after a claim.
      queryClient.invalidateQueries({ queryKey: ["stars", tripId] });
      setCelebrateKey((k) => k + 1);
    },
  });

  const [revealed, setRevealed] = useState(false);
  // Prefer API challenges; fall back to the content's generic star_challenge.
  const legacyChallenge = apiChallengesForDay.length === 0 ? day.star_challenge : null;
  const claimedChallenge = hasClaimed(stars, profile.id, day.id, "challenge");
  const count = balanceFor(stars, profile.id);
  const moneyValue = (starValue * count).toLocaleString("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

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
              {starCurrency} {moneyValue} of holiday spending money
            </span>
          </div>

          {/* API per-child challenges for this day */}
          {apiChallengesForDay.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                marginTop: "var(--space-2)",
              }}
            >
              {apiChallengesForDay.map((c, i) => (
                <ApiChallengeCard key={c.id ?? i} challenge={c} />
              ))}
            </div>
          ) : challengesQuery.data && apiChallengesForDay.length === 0 && !legacyChallenge ? (
            // API responded but no challenges for this child on this day
            <p
              style={{
                margin: "var(--space-2) 0 0",
                color: "var(--text-muted)",
                fontWeight: 600,
                fontSize: "var(--fs-sm, .9rem)",
              }}
            >
              No challenges today — keep exploring!
            </p>
          ) : null}

          {/* Legacy content-level challenge fallback */}
          {legacyChallenge ? (
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
              <p style={{ margin: 0, fontWeight: 700 }}>{legacyChallenge.question}</p>
              {revealed ? (
                <p style={{ margin: 0, color: "var(--royal-700)" }}>{legacyChallenge.answer}</p>
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

/** Renders a single per-child API challenge with the same visual style as ChallengeBlock. */
function ApiChallengeCard({
  challenge,
}: {
  challenge: import("@/lib/contract-mock/types").TripChallenge;
}) {
  const [revealed, setRevealed] = useState(false);
  const tone = KIND_TONE[challenge.kind] ?? "var(--meadow-400)";
  const label = KIND_LABEL[challenge.kind] ?? challenge.kind;

  return (
    <div
      data-testid="api-challenge"
      style={{
        padding: "var(--space-3)",
        background: "var(--surface-sunk)",
        border: `2.5px solid ${tone}`,
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "var(--fs-xs)",
          letterSpacing: "var(--ls-caps)",
          textTransform: "uppercase",
          color: tone,
        }}
      >
        {label}
        {challenge.stars > 0 ? (
          <Badge tone="sun" style={{ marginLeft: "var(--space-2)" }}>
            {challenge.stars} {challenge.stars === 1 ? "star" : "stars"}
          </Badge>
        ) : null}
      </span>
      <p style={{ margin: 0, fontWeight: 700 }}>{challenge.prompt}</p>
      {challenge.answer ? (
        <>
          {revealed ? (
            <p style={{ margin: 0, color: "var(--royal-700)" }}>{challenge.answer}</p>
          ) : null}
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="yc-btn yc-btn--secondary yc-btn--sm"
            style={{ alignSelf: "flex-start" }}
            aria-expanded={revealed}
          >
            {revealed ? "Hide answer" : "Reveal the answer"}
          </button>
        </>
      ) : null}
    </div>
  );
}
