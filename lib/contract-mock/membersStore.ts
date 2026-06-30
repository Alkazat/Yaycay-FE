/**
 * MOCK per-trip membership store. Module-level (shared across route handlers
 * in the same Next.js server process). Resets on restart; mirrors profileStore.
 *
 * Maps tripId -> Set of profileIds. On first access for a trip, the roster is
 * seeded with the full account family so existing e2e tests keep passing.
 */
import { listProfiles } from "./profileStore";

const tripRosters = new Map<string, Set<string>>();

export function getRoster(tripId: string): Set<string> {
  if (!tripRosters.has(tripId)) {
    const all = listProfiles().map((p) => p.id);
    tripRosters.set(tripId, new Set(all));
  }
  return tripRosters.get(tripId)!;
}

export function addMember(tripId: string, profileId: string): boolean {
  const roster = getRoster(tripId);
  const already = roster.has(profileId);
  roster.add(profileId);
  return !already; // true = newly added (201), false = already present (200)
}

export function removeMember(tripId: string, profileId: string): boolean {
  const roster = getRoster(tripId);
  return roster.delete(profileId); // true = deleted, false = not found
}
