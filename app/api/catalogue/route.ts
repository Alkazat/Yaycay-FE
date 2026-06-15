import { NextResponse } from "next/server";
import { MOCK_CATALOGUE } from "@/lib/contract-mock/data";

/**
 * MOCK pricing catalogue. The live BE sources these amounts from Stripe so the
 * UI stays in sync with the dashboard. Swap to the live handler once
 * `GET /catalogue` exists (then flip `SERVED.catalogue`).
 */
export async function GET() {
  return NextResponse.json({ products: MOCK_CATALOGUE });
}
