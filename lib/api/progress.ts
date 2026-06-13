import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  ProgressUpdateRequest,
  TripProgress,
  TripProgressResponse,
} from "@/lib/contract-mock/types";

/** A profile with no stored progress yet reads as an empty done set. */
function emptyProgress(profileId: string): TripProgress {
  return { profile_id: profileId, done_items: [], updated_at: new Date(0).toISOString() };
}

/** The contract returns every profile's row; the FE works one profile at a time. */
function pick(res: TripProgressResponse, profileId: string): TripProgress {
  return res.progress.find((p) => p.profile_id === profileId) ?? emptyProgress(profileId);
}

export async function getProgress(
  tripId: string,
  profileId: string,
  signal?: AbortSignal,
): Promise<TripProgress> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(
    `/trips/${tripId}/progress?profile_id=${encodeURIComponent(profileId)}`,
    SERVED.progress,
    { signal, accessToken },
  );
  if (!res.ok) throw new Error(`Failed to load progress (${res.status})`);
  return pick((await res.json()) as TripProgressResponse, profileId);
}

export async function setActivityDone(
  tripId: string,
  profileId: string,
  activityId: string,
  done: boolean,
): Promise<TripProgress> {
  const accessToken = await getAccessToken();
  // Incremental mark_done / mark_undone keeps concurrent per-activity ticks safe.
  const body: ProgressUpdateRequest = {
    profile_id: profileId,
    ...(done ? { mark_done: [activityId] } : { mark_undone: [activityId] }),
  };
  const res = await apiFetch(`/trips/${tripId}/progress`, SERVED.progress, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to save progress (${res.status})`);
  return pick((await res.json()) as TripProgressResponse, profileId);
}
