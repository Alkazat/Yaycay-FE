import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { SignUploadResponse } from "@/lib/contract-mock/types";

/**
 * Sign a print-grade photo upload, returning where to PUT the bytes and the
 * `media_ref` to store on the journal entry. BE owns Storage + signing; the FE
 * compresses then uploads. Deferred on BE - mock-backed until it ships.
 */
export async function signUpload(
  tripId: string,
  contentType: string,
): Promise<SignUploadResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/media/sign-upload", SERVED.media, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ trip_id: tripId, content_type: contentType }),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to sign upload (${res.status})`);
  return (await res.json()) as SignUploadResponse;
}
