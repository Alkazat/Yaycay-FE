/**
 * MOCK child-profiles store - TEMPORARY. Seeded from the static `MOCK_PROFILES`
 * and made mutable so create/update/delete work in mock mode. Module memory;
 * resets on restart. Swap target: BE `GET|POST /profiles`, `PATCH|DELETE
 * /profiles/:id`.
 */
import { MOCK_PROFILES } from "./data";
import type { ChildProfile, ChildProfileInput } from "./types";

let profiles: ChildProfile[] = MOCK_PROFILES.map((p) => ({ ...p }));
let seq = 0;

export function listProfiles(): ChildProfile[] {
  return profiles;
}

export function createProfile(input: ChildProfileInput): ChildProfile {
  const now = new Date().toISOString();
  const profile: ChildProfile = {
    id: `p_${(seq += 1)}_${Math.random().toString(36).slice(2, 7)}`,
    name: input.name ?? "Explorer",
    avatar: input.avatar ?? null,
    age: input.age ?? null,
    mode: input.mode ?? null,
    interests: input.interests ?? [],
    dietary: input.dietary ?? [],
    medical: input.medical ?? [],
    created_at: now,
    updated_at: now,
  };
  profiles = [...profiles, profile];
  return profile;
}

export function updateProfile(id: string, input: ChildProfileInput): ChildProfile | undefined {
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx < 0) return undefined;
  const cur = profiles[idx];
  const updated: ChildProfile = {
    ...cur,
    name: input.name ?? cur.name,
    avatar: input.avatar !== undefined ? input.avatar : cur.avatar,
    age: input.age !== undefined ? input.age : cur.age,
    mode: input.mode !== undefined ? input.mode : cur.mode,
    interests: input.interests ?? cur.interests,
    dietary: input.dietary ?? cur.dietary,
    medical: input.medical ?? cur.medical,
    updated_at: new Date().toISOString(),
  };
  profiles[idx] = updated;
  return updated;
}

export function deleteProfile(id: string): boolean {
  const before = profiles.length;
  profiles = profiles.filter((p) => p.id !== id);
  return profiles.length < before;
}
