import type { Tier } from "@/lib/contract-mock/types";

/**
 * Tier-aware UI gating. The source of truth for entitlement is BE (`purchases`,
 * set by the Stripe webhook); the FE only reads the resolved tier to decide
 * what to show. Keep this pure and exhaustively tested.
 */

/** Capabilities the UI gates on, derived purely from the tier. */
export interface Entitlements {
  /** Can open and render a full multi-day trip (not just the demo day). */
  canViewFullTrip: boolean;
  /** Planning chat on our guardrailed AI (use-our-AI tier). */
  canUseOurAi: boolean;
  /** BYO-AI MCP connector screen. */
  canUseByoConnector: boolean;
  /** Journal notes + print-grade photo upload. */
  canJournal: boolean;
  /** Offline cache + background sync (premium only). */
  canUseOffline: boolean;
}

export function entitlementsFor(tier: Tier): Entitlements {
  const paid = tier === "byo" || tier === "ours";
  return {
    canViewFullTrip: paid,
    canUseOurAi: tier === "ours",
    canUseByoConnector: tier === "byo",
    canJournal: paid,
    canUseOffline: paid,
  };
}

/** Convenience: is this a paid (non-demo) tier? */
export function isPaidTier(tier: Tier): boolean {
  return tier === "byo" || tier === "ours";
}
