import { NextResponse } from "next/server";
import { getStars } from "@/lib/contract-mock/starsStore";

/** MOCK star ledger read. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Contract `GET /trips/:id/stars` returns the whole trip ledger (all children).
  return NextResponse.json(getStars(id));
}
