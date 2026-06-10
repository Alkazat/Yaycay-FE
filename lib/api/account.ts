import { endpointUrl, SERVED } from "@/lib/api/http";
import type {
  AccountSummary,
  CheckoutRequest,
  CheckoutResponse,
} from "@/lib/contract-mock/types";

export async function getAccount(signal?: AbortSignal): Promise<AccountSummary> {
  const res = await fetch(endpointUrl("/account", SERVED.account), { signal });
  if (!res.ok) throw new Error(`Failed to load account (${res.status})`);
  return (await res.json()) as AccountSummary;
}

/**
 * Create a Checkout session and return its hosted URL. BE owns session
 * creation and the Stripe webhook that grants entitlement; the FE only opens
 * the returned URL. Canonical path: `POST /checkout/session`.
 */
export async function createCheckoutSession(
  req: CheckoutRequest,
): Promise<CheckoutResponse> {
  const res = await fetch(endpointUrl("/checkout/session", SERVED.checkout), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Failed to start checkout (${res.status})`);
  return (await res.json()) as CheckoutResponse;
}
