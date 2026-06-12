import { apiFetch, SERVED } from "@/lib/api/http";
import type { TwoFactorVerifyResponse } from "@/lib/contract-mock/types";

/** Verify the one-time second-factor code (served: POST /auth/2fa/verify). */
export async function verifyTwoFactor(
  email: string,
  code: string,
): Promise<TwoFactorVerifyResponse> {
  const res = await apiFetch("/auth/2fa/verify", SERVED.auth2fa, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code }),
    livePath: "/auth-2fa-verify",
  });
  if (!res.ok) throw new Error(`2FA verify failed (${res.status})`);
  return (await res.json()) as TwoFactorVerifyResponse;
}
