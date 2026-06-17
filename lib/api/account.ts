import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import { getAffiliateCode } from "@/lib/affiliate/code";
import type {
  AccountSummary,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
} from "@/lib/contract-mock/types";

/**
 * The account summary plus the consumer-editable profile name. `name` is not in
 * the published contract yet, so it is mock-backed alongside the rest of the
 * account; BE adds it to `AccountSummary` (see docs/handoffs/14).
 */
export type AccountProfile = AccountSummary & { name: string | null };

/** Body for `PATCH /account`. Send a field as `null` to clear it. */
export interface AccountProfileUpdate {
  name?: string | null;
  secondary_email?: string | null;
}

export async function getAccount(signal?: AbortSignal): Promise<AccountProfile> {
  // Authenticated; carry the signed-in user's JWT when available.
  const accessToken = await getAccessToken();
  const res = await apiFetch("/account", SERVED.account, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load account (${res.status})`);
  return (await res.json()) as AccountProfile;
}

/**
 * Update the consumer-mutable account fields (display name, recovery email).
 * Send a field as `null` to clear it. Returns the updated summary.
 * Canonical path: `PATCH /account`.
 */
export async function updateAccount(update: AccountProfileUpdate): Promise<AccountProfile> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/account", SERVED.account, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(update),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to update account (${res.status})`);
  return (await res.json()) as AccountProfile;
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
