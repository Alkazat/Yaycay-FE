import { apiFetch, SERVED } from "@/lib/api/http";
import type {
  SignupCaptureRequest,
  SignupCaptureResponse,
} from "@/lib/contract-mock/types";

/**
 * Capture an account + email at signup (synced to Brevo by BE). Served by the
 * live contract (`POST /signup/capture`); backed by the in-repo mock until the
 * API base is configured.
 */
export async function captureSignup(
  req: SignupCaptureRequest,
): Promise<SignupCaptureResponse> {
  const res = await apiFetch("/signup/capture", SERVED.signupCapture, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Signup capture failed (${res.status})`);
  return (await res.json()) as SignupCaptureResponse;
}
