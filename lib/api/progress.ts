import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { ProgressState } from "@/lib/contract-mock/types";

export async function getProgress(
  tripId: string,
  profileId: string,
  signal?: AbortSignal,
): Promise<ProgressState> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(
    `/trips/${tripId}/progress?profile_id=${encodeURIComponent(profileId)}`,
    SERVED.progress,
    { signal, accessToken },
  );
  if (!res.ok) throw new Error(`Failed to load progress (${res.status})`);
  return (await res.json()) as ProgressState;
}

export async function setActivityDone(
  tripId: string,
  profileId: string,
  activityId: string,
  done: boolean,
): Promise<ProgressState> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/progress`, SERVED.progress, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ profile_id: profileId, activity_id: activityId, done }),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to save progress (${res.status})`);
  return (await res.json()) as ProgressState;
}
