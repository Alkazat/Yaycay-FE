import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { ChildProfile, ChildProfileInput } from "@/lib/contract-mock/types";

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
export async function updateProfile(
  id: string,
  input: ChildProfileInput,
): Promise<ChildProfile> {
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
