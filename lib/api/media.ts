import { apiFetch, isLiveCall, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { SignUploadResponse } from "@/lib/contract-mock/types";

/**
 * Sign a print-grade photo upload, returning where to PUT the bytes and the
 * `media_ref` to store on the journal entry. BE owns Storage + signing; the FE
 * compresses then uploads.
 */
export async function signUpload(
  tripId: string,
  contentType: string,
): Promise<SignUploadResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/media/sign-upload", SERVED.media, {
    method: "POST",
    // Two-segment contract path deploys as a single hyphenated function.
    livePath: "/media-sign-upload",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ trip_id: tripId, content_type: contentType }),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to sign upload (${res.status})`);
  return (await res.json()) as SignUploadResponse;
}

/**
 * Sign + upload a photo for a trip, returning the `media_ref` to attach to a
 * journal entry. On the live BE the file bytes are PUT to the short-lived signed
 * Storage URL; in mock mode there is no real bucket, so we skip the PUT and just
 * return the placeholder ref for preview.
 */
export async function uploadPhoto(tripId: string, file: File): Promise<string> {
  const signed = await signUpload(tripId, file.type || "image/jpeg");
  if (isLiveCall(SERVED.media)) {
    const put = await fetch(signed.upload_url, {
      method: "PUT",
      headers: { "content-type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!put.ok) throw new Error(`Failed to upload photo (${put.status})`);
  }
  return signed.media_ref;
}
