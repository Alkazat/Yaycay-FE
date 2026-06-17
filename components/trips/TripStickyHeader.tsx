"use client";

import { useQuery } from "@tanstack/react-query";
import { getStars } from "@/lib/api/stars";
import { balanceFor, sgdValue, STAR_CURRENCY } from "@/lib/stars";
import { ProfileSwitcher } from "@/components/profile/ProfileSwitcher";
import { ExplorePlanSwitch } from "@/components/trips/ExplorePlanSwitch";
import { Badge } from "@/components/ds";
import { formatDateRange } from "@/lib/format";
import type { TripMode } from "@/components/trips/useTripPlanning";
import type { ChildProfile } from "@/lib/contract-mock/types";

/**
 * One compact, sticky sub-header for a trip: title, dates, days explored, the
 * profile switcher and pocket money - all in a single bar that sticks beneath
 * the app bar (`--appbar-h`).
 */
export function TripStickyHeader({
  tripId,
  title,
  startDate,
  endDate,
  daysComplete,
  totalDays,
  profiles,
  activeProfileId,
  onSelectProfile,
  showPocketMoney,
  canPlan,
  mode,
  onModeChange,
}: {
  tripId: string;
  title: string;
  startDate?: string;
  endDate?: string;
  daysComplete: number;
  totalDays: number;
  profiles: ChildProfile[];
  activeProfileId: string | null;
  onSelectProfile: (id: string) => void;
  showPocketMoney: boolean;
  canPlan: boolean;
  mode: TripMode;
  onModeChange: (mode: TripMode) => void;
}) {
  const stars = useQuery({
    queryKey: ["stars", tripId, activeProfileId],
    queryFn: ({ signal }) => getStars(tripId, activeProfileId!, signal),
    enabled: showPocketMoney && !!activeProfileId,
  });
  const balance = activeProfileId ? balanceFor(stars.data, activeProfileId) : 0;

  return (
    <div className="yc-tripbar">
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <strong style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-h4)", color: "var(--royal-800)" }}>
          {title}
        </strong>
        {startDate && endDate ? (
          <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
            {formatDateRange(startDate, endDate)}
          </span>
        ) : null}
        <span style={{ marginLeft: "auto", display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <Badge tone="meadow">
            {daysComplete}/{totalDays} days explored
          </Badge>
          {showPocketMoney ? (
            <Badge tone="sun">
              ⭐ {balance} ({STAR_CURRENCY}
              {sgdValue(balance)})
            </Badge>
          ) : null}
        </span>
      </div>
      {canPlan ? (
        <div style={{ marginTop: "var(--space-3)" }}>
          <ExplorePlanSwitch mode={mode} onChange={onModeChange} />
        </div>
      ) : null}
      {profiles.length > 0 ? (
        <div style={{ marginTop: "var(--space-2)" }}>
          <ProfileSwitcher profiles={profiles} activeId={activeProfileId} onSelect={onSelectProfile} />
        </div>
      ) : null}
    </div>
  );
}
