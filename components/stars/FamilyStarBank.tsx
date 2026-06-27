"use client";

import { useQuery } from "@tanstack/react-query";
import { getStars } from "@/lib/api/stars";
import { balanceFor, STAR_CURRENCY, STAR_VALUE } from "@/lib/stars";
import type { ChildProfile } from "@/lib/contract-mock/types";
import { Card, CardBody, Badge } from "@/components/ds";
import { useTripRewards } from "@/components/trips/useTripEconomics";

/**
 * The family Star Bank shown on the book's Home - emulating the gold standard's
 * "1 STAR = $3 SGD" home card with a row per explorer. The whole-trip ledger is
 * one fetch (`getStars`); each child's total comes from `balanceFor`. The per-day
 * claimable challenge stays on the day pages (StarBank), not here.
 */
export function FamilyStarBank({
  tripId,
  kids,
  activeId,
}: {
  tripId: string;
  kids: ChildProfile[];
  activeId: string | null;
}) {
  const { data } = useQuery({
    queryKey: ["stars", tripId, "family"],
    queryFn: ({ signal }) => getStars(tripId, "family", signal),
  });
  const rewardsQuery = useTripRewards(tripId);

  // Use the trip-default reward config (profile_id == null) when available;
  // fall back to the hardcoded prototype values.
  const defaultReward = rewardsQuery.data?.rewards.find((r) => r.profile_id == null);
  const starValue = defaultReward?.star_value ?? STAR_VALUE;
  const starCurrency = defaultReward?.currency ?? STAR_CURRENCY;
  const starTarget = defaultReward?.star_target;
  const starBudget = defaultReward?.star_budget;

  // Total stars earned across all children (from balances)
  const totalStars = kids.reduce((sum, k) => sum + balanceFor(data, k.id), 0);

  function rewardValue(stars: number): string {
    return `${starCurrency} ${(stars * starValue).toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  return (
    <Card>
      <CardBody title="Star bank">
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          1 star = {starValue} {starCurrency} of holiday spending money
        </p>
        {starTarget != null ? (
          <p style={{ margin: 0, color: "var(--royal-700)", fontWeight: 700 }}>
            {totalStars} / {starTarget} stars
            {starBudget != null ? (
              <span style={{ color: "var(--meadow-600)", fontWeight: 800 }}>
                {" "}
                · {starCurrency} {starBudget} earnable
              </span>
            ) : null}
          </p>
        ) : null}
        <div className="yc-fsb">
          {kids.map((k) => {
            const n = balanceFor(data, k.id);
            return (
              <div
                key={k.id}
                className="yc-fsb__row"
                data-active={k.id === activeId ? "true" : undefined}
              >
                <span className="yc-fsb__avatar" aria-hidden="true">
                  {k.avatar ?? (k.name.trim()[0] ?? "?").toUpperCase()}
                </span>
                <span className="yc-fsb__name">{k.name}</span>
                <Badge tone="sun">
                  {n} {n === 1 ? "star" : "stars"}
                </Badge>
                <span className="yc-fsb__sgd">{rewardValue(n)}</span>
              </div>
            );
          })}
        </div>
        <style>{`
          .yc-fsb { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-2); }
          .yc-fsb__row {
            display: flex; align-items: center; gap: var(--space-3);
            padding: var(--space-2) var(--space-3);
            border-radius: var(--radius-md, 12px);
            background: var(--surface-sunk, #f4eedf);
            border: 2.5px solid transparent;
          }
          .yc-fsb__row[data-active="true"] { border-color: var(--sky-300, #8fcdfb); background: var(--sky-50, #eaf6ff); }
          .yc-fsb__avatar {
            display: grid; place-items: center; width: 34px; height: 34px; flex: 0 0 auto;
            border-radius: var(--radius-pill, 999px);
            background: var(--sun-200, #ffe08a); border: 2.5px solid var(--royal-500, #0a4c8b);
            font-family: var(--font-display); font-weight: 800; color: var(--royal-700, #0a4c8b);
          }
          .yc-fsb__name { font-family: var(--font-display); font-weight: 700; color: var(--royal-700, #0a4c8b); flex: 1 1 auto; }
          .yc-fsb__sgd { font-weight: 800; color: var(--meadow-600, #2e9e5b); white-space: nowrap; }
        `}</style>
      </CardBody>
    </Card>
  );
}
