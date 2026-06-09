import { NextResponse } from "next/server";
import { MOCK_TRIPS } from "@/lib/contract-mock/data";

/** MOCK list-trips. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET() {
  return NextResponse.json({ trips: MOCK_TRIPS });
}
