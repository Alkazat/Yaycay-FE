import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { Transaction } from "@alkazat/contracts";

/**
 * A billing line item (`GET /account/transactions`). Live as of contract @0.31 -
 * Stripe-sourced from the purchases table; each line carries `trip_id`/`trip_name`
 * tying the charge to the trip it bought (null for account-level charges).
 */
export type { Transaction };

export async function listTransactions(signal?: AbortSignal): Promise<Transaction[]> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/account/transactions", SERVED.transactions, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load transactions (${res.status})`);
  return ((await res.json()) as { transactions: Transaction[] }).transactions;
}
