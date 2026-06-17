import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";

/**
 * A billing line item. Local shape - there is no `@alkazat/contracts` billing
 * endpoint yet, so this is mock-backed (`SERVED.transactions = false`). When BE
 * ships `GET /account/transactions`, return its `Transaction` DTO and flip the flag.
 */
export interface Transaction {
  id: string;
  /** ISO 8601. */
  date: string;
  description: string;
  amount_usd: number;
  status: "paid" | "refunded" | "pending";
  /** The trip this charge belongs to, when it relates to one; null otherwise. */
  trip_id: string | null;
  /** Denormalised trip destination for display (BE sends it alongside trip_id). */
  trip_name: string | null;
}

export async function listTransactions(signal?: AbortSignal): Promise<Transaction[]> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/account/transactions", SERVED.transactions, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load transactions (${res.status})`);
  return ((await res.json()) as { transactions: Transaction[] }).transactions;
}
