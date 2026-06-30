/**
 * MOCK child-profiles store - TEMPORARY. Seeded from the static `MOCK_PROFILES`
 * and made mutable so create/update/delete work in mock mode. Module memory;
 * resets on restart. Swap target: BE `GET|POST /profiles`, `PATCH|DELETE
 * /profiles/:id`.
 */
import { MOCK_PROFILES, MOCK_PINS } from "./data";
import type { ChildProfile, ChildProfileInput } from "./types";

let profiles: ChildProfile[] = MOCK_PROFILES.map((p) => ({ ...p }));
let seq = 0;

/**
 * PIN store, kept OUT of the profile record - mirrors the contract rule that a
 * PIN is never returned by the API (only `pin_set: boolean` is surfaced). Maps
 * profile id -> 4-digit PIN. Module memory; resets on restart.
 */
const pins = new Map<string, string>(Object.entries(MOCK_PINS));

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
    // Default to a child profile - the safe default (no Grown-ups access).
    type: input.type ?? "child",
    mode: input.mode ?? null,
    pin_set: false,
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
    type: input.type ?? cur.type,
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
  pins.delete(id);
  return profiles.length < before;
}

/**
 * Set / change a parent/carer PIN (`POST /profiles/:id/pin`). Flips `pin_set` on the
 * record; the PIN value itself is stored separately and never returned. Returns
 * the updated profile, or `undefined` if the profile does not exist.
 */
export function setPin(id: string, pin: string): ChildProfile | undefined {
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx < 0) return undefined;
  pins.set(id, pin);
  profiles[idx] = { ...profiles[idx], pin_set: true, updated_at: new Date().toISOString() };
  return profiles[idx];
}

/**
 * Verify a parent/carer PIN (`POST /profiles/:id/pin/verify`). Returns `true` only
 * when a PIN is configured and matches. (Real BE adds hashing + rate limiting;
 * this mock just compares.)
 */
export function verifyPin(id: string, pin: string): boolean {
  const expected = pins.get(id);
  return expected !== undefined && expected === pin;
}

/**
 * MOCK explorer-login store (`/profiles/:id/login`). Maps profile id -> the
 * login's email + timestamps. The real BE mints a Supabase auth user; this mock
 * just records the link so the manage UI works in mock/e2e mode. Module memory.
 */
interface LoginRecord {
  email: string;
  invited_at: string;
  disabled_at: string | null;
}
const logins = new Map<string, LoginRecord>();

export function profileExists(id: string): boolean {
  return profiles.some((p) => p.id === id);
}

export function getLogin(id: string) {
  const l = logins.get(id);
  const active = !!l && !l.disabled_at;
  return {
    enabled: active,
    email: l?.email ?? null,
    invited_at: l?.invited_at ?? null,
    disabled_at: l?.disabled_at ?? null,
  };
}

/** Provision a login (idempotent). `created` is false when one was already active. */
export function enableLogin(id: string, email: string) {
  const existing = logins.get(id);
  if (existing && !existing.disabled_at) {
    return { status: getLogin(id), action_link: null, created: false };
  }
  logins.set(id, { email, invited_at: new Date().toISOString(), disabled_at: null });
  return { status: getLogin(id), action_link: `https://mock.yaycay.local/login#${id}`, created: true };
}

export function disableLogin(id: string) {
  const l = logins.get(id);
  if (!l || l.disabled_at) return null;
  logins.set(id, { ...l, disabled_at: new Date().toISOString() });
  return getLogin(id);
}
