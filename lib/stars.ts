import type { StarsResponse, StarSource } from "@/lib/contract-mock/types";

/** 1 star = this much holiday spending money (configurable; prototype: 3 SGD). */
export const STAR_VALUE = 3;
export const STAR_CURRENCY = "SGD";

export function sgdValue(stars: number): number {
  return stars * STAR_VALUE;
}

/** A child's running star total from the ledger balances. */
export function balanceFor(res: StarsResponse | undefined, profileId: string): number {
  return res?.balances.find((b) => b.profile_id === profileId)?.stars ?? 0;
}

/**
 * Whether this child has already claimed a star for `dayId` from `source`.
 * The contract scopes a claim by `day` and a free-string `source`; the FE only
 * claims `"game"` / `"challenge"`, so we match the kind exactly or as a
 * `"<kind>:<id>"` prefix (BE may suffix the source with the originating id).
 */
export function hasClaimed(
  res: StarsResponse | undefined,
  profileId: string,
  dayId: string,
  source: StarSource,
): boolean {
  if (!res) return false;
  return res.entries.some(
    (e) =>
      e.profile_id === profileId &&
      e.day === dayId &&
      (e.source === source || e.source.startsWith(`${source}:`)),
  );
}
