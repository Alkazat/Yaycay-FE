import { NextResponse } from "next/server";
import { MOCK_TRANSACTIONS } from "@/lib/contract-mock/data";

/**
 * MOCK transaction history. There is no contract billing endpoint yet; this
 * stands in so the settings page renders. Swap to the live BE handler once
 * `GET /account/transactions` exists.
 */
export async function GET() {
  return NextResponse.json({ transactions: MOCK_TRANSACTIONS });
}
