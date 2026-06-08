/**
 * Pure journal helpers. The brand celebrates warm progress, so ratings are
 * always whole stars in 1-5 and averages are rounded for friendly display.
 */

/** Clamp any input to a whole star count in the 1-5 range. */
export function clampStars(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(1, Math.min(5, Math.round(value)));
}

/** Average star rating across entries that have a rating, or null if none. */
export function averageStars(values: Array<number | undefined>): number | null {
  const rated = values.filter((v): v is number => typeof v === "number");
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}
