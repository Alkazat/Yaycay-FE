import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import { getAffiliateCode } from "@/lib/affiliate/code";
import type {
  AccountSummary,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
} from "@/lib/contract-mock/types";

export async function getAccount(signal?: AbortSignal): Promise<AccountSummary> {
  // Authenticated; carry the signed-in user's JWT when available.
  const accessToken = await getAccessToken();
  const res = await apiFetch("/account", SERVED.account, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load account (${res.status})`);
  return (await res.json()) as AccountSummary;
}

/**
 * Create a Checkout session and return its hosted URL. BE owns session
 * creation and the Stripe webhook that grants entitlement; the FE only opens
 * the returned URL. Canonical path: `POST /checkout/session`.
 */
export async function createCheckoutSession(
  req: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const accessToken = await getAccessToken();
  // Default the affiliate attribution to the captured `/go/<slug>` code so no
  // call site can drop it. An explicit code on `req` still wins; BE ignores an
  // unknown code, so this never blocks checkout.
  const body: CheckoutSessionRequest = { ...req, code: req.code ?? getAffiliateCode() };
  const res = await apiFetch("/checkout/session", SERVED.checkout, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to start checkout (${res.status})`);
  return (await res.json()) as CheckoutSessionResponse;
}
