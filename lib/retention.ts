/**
 * Data retention status. Trip data is scheduled for deletion 12 months after
 * the holiday unless a keep-token is bought (model context section 12).
 * Pure - the UI uses this to decide how loudly to prompt for data-keep.
 */

export interface RetentionStatus {
  /** No expiry set, or a keep-token already covers it. */
  kept: boolean;
  /** Whole days until deletion (0 if already past). */
  daysLeft: number;
  /** Deletion date has passed. */
  expired: boolean;
  /** Within 60 days of deletion - prompt warmly. */
  soon: boolean;
}

const MS_PER_DAY = 86_400_000;
const SOON_DAYS = 60;

export function retentionStatus(
  expiresAt: string | undefined,
  kept: boolean | undefined,
  now: number = Date.now(),
): RetentionStatus {
  if (kept || !expiresAt) {
    return { kept: true, daysLeft: Infinity, expired: false, soon: false };
  }
  const expiry = Date.parse(expiresAt);
  if (Number.isNaN(expiry)) {
    return { kept: true, daysLeft: Infinity, expired: false, soon: false };
  }
  const ms = expiry - now;
  const daysLeft = Math.max(0, Math.ceil(ms / MS_PER_DAY));
  return {
    kept: false,
    daysLeft,
    expired: ms <= 0,
    soon: ms > 0 && daysLeft <= SOON_DAYS,
  };
}
