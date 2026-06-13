import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { ChildProfile } from "@/lib/contract-mock/types";

/** Result of a Grown-ups PIN verification (contract v0.15). */
export interface PinVerifyResult {
  ok: boolean;
  /** Attempts left before the gate locks out. */
  attempts_remaining?: number | null;
  /** When the gate unlocks again after too many failed attempts. */
  locked_until?: string | null;
}

/** Set or change a parent/carer profile's Grown-ups PIN. */
export async function setProfilePin(profileId: string, pin: string): Promise<ChildProfile> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/profiles/${profileId}/pin`, SERVED.profilePin, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pin }),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to set PIN (${res.status})`);
  return (await res.json()) as ChildProfile;
}

/** Verify a parent/carer PIN to unlock the Grown-ups view. */
export async function verifyProfilePin(profileId: string, pin: string): Promise<PinVerifyResult> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/profiles/${profileId}/pin/verify`, SERVED.profilePin, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pin }),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to verify PIN (${res.status})`);
  return (await res.json()) as PinVerifyResult;
}
