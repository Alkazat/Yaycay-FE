/**
 * MOCK star ledger - TEMPORARY. Stands in for the BE `star_ledger` until the
 * live API exists. Claims are idempotent per profile per day per source. Module
 * memory; resets on restart. Swap target: BE `/trips/:id/stars` endpoints.
 */
import type { StarBalance, StarClaimResponse, StarLedgerEntry, StarsResponse } from "./types";

const store = new Map<string, StarLedgerEntry[]>();
let seq = 0;

function ledger(tripId: string): StarLedgerEntry[] {
  if (!store.has(tripId)) store.set(tripId, []);
  return store.get(tripId)!;
}

function balances(entries: StarLedgerEntry[]): StarBalance[] {
  const totals = new Map<string, number>();
  for (const e of entries) totals.set(e.profile_id, (totals.get(e.profile_id) ?? 0) + e.stars);
  return [...totals].map(([profile_id, stars]) => ({ profile_id, stars }));
}

function balanceFor(entries: StarLedgerEntry[], profileId: string): number {
  return balances(entries).find((b) => b.profile_id === profileId)?.stars ?? 0;
}

export function getStars(tripId: string): StarsResponse {
  const entries = ledger(tripId);
  return { balances: balances(entries), entries: [...entries] };
}

export function claimStar(
  tripId: string,
  profileId: string,
  source: string,
  day: string,
  stars = 1,
): StarClaimResponse {
  const entries = ledger(tripId);
  const existing = entries.find(
    (e) => e.profile_id === profileId && e.day === day && e.source === source,
  );
  if (existing) {
    return { claimed: false, entry: existing, balance: balanceFor(entries, profileId) };
  }
  const entry: StarLedgerEntry = {
    id: `star_${(seq += 1)}`,
    profile_id: profileId,
    source,
    day,
    stars,
    created_at: new Date().toISOString(),
  };
  entries.push(entry);
  return { claimed: true, entry, balance: balanceFor(entries, profileId) };
}
