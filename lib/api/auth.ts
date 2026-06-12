import { apiFetch, SERVED } from "@/lib/api/http";
import type {
  TwoFactorVerifyRequest,
  TwoFactorVerifyResponse,
} from "@/lib/contract-mock/types";

/**
 * Verify the one-time second-factor code (served: POST /auth/2fa/verify).
 * The contract request body is just `{ code }`; the user is identified by the
 * session, so `email` is accepted for caller convenience but not sent.
 */
export async function verifyTwoFactor(
  email: string,
  code: string,
): Promise<TwoFactorVerifyResponse> {
  void email;
  const body: TwoFactorVerifyRequest = { code };
  const res = await apiFetch("/auth/2fa/verify", SERVED.auth2fa, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    livePath: "/auth-2fa-verify",
  });
  if (!res.ok) throw new Error(`2FA verify failed (${res.status})`);
  return (await res.json()) as TwoFactorVerifyResponse;
}
