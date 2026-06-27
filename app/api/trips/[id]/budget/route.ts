import { NextResponse } from "next/server";
import type { BudgetResponse } from "@/lib/contract-mock/types";

/** MOCK trip budget. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const budget: BudgetResponse = {
    budget: {
      trip_id: id,
      base_currency: "THB",
      home_currency: "AUD",
      exchange_rate: 22.5,
      rate_as_of: "2026-06-01T00:00:00Z",
      cash_budget: 5000,
      daily_cash_budget: 500,
      updated_at: new Date().toISOString(),
    },
  };

  return NextResponse.json(budget);
}
