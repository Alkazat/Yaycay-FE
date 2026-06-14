import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  ChildProfile,
  ChildProfileInput,
  ProfilePinVerifyResponse,
} from "@/lib/contract-mock/types";

/** Create a child profile (`POST /profiles`). */
export async function createProfile(input: ChildProfileInput): Promise<ChildProfile> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/profiles", SERVED.profiles, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to create profile (${res.status})`);
  return (await res.json()) as ChildProfile;
}

/** Update a child profile (`PATCH /profiles/:id`). */
export async function updateProfile(id: string, input: ChildProfileInput): Promise<ChildProfile> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/profiles/${id}`, SERVED.profiles, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to update profile (${res.status})`);
  return (await res.json()) as ChildProfile;
}

/** Delete a child profile (`DELETE /profiles/:id`). */
export async function deleteProfile(id: string): Promise<void> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/profiles/${id}`, SERVED.profiles, {
    method: "DELETE",
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to delete profile (${res.status})`);
}

/**
 * Set / change a guardian PIN (`POST /profiles/:id/pin`). The PIN is write-only;
 * the response carries the updated profile (with `pin_set: true`).
 */
export async function setProfilePin(id: string, pin: string): Promise<ChildProfile> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/profiles/${id}/pin`, SERVED.profilesPin, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pin }),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to set PIN (${res.status})`);
  return (await res.json()) as ChildProfile;
}

/**
 * Verify a guardian PIN to unlock the Grown-ups view
 * (`POST /profiles/:id/pin/verify`). Resolves to `true` on a correct PIN.
 */
export async function verifyProfilePin(id: string, pin: string): Promise<boolean> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/profiles/${id}/pin/verify`, SERVED.profilesPin, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pin }),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to verify PIN (${res.status})`);
  const data = (await res.json()) as ProfilePinVerifyResponse;
  return data.ok;
}
