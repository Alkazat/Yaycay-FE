import type { StarsState, StarSource } from "@/lib/contract-mock/types";

/** 1 star = this much holiday spending money (configurable; prototype: 3 SGD). */
export const STAR_VALUE = 3;
export const STAR_CURRENCY = "SGD";

export function sgdValue(stars: number): number {
  return stars * STAR_VALUE;
}

/** Idempotency key for a claim: one star per profile per day per source. */
export function claimKey(dayId: string, source: StarSource): string {
  return `${dayId}:${source}`;
}

export function hasClaimed(state: StarsState, dayId: string, source: StarSource): boolean {
  return state.claims.includes(claimKey(dayId, source));
}
