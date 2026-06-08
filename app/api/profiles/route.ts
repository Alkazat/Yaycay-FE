import { NextResponse } from "next/server";
import { MOCK_PROFILES } from "@/lib/contract-mock/data";

/** MOCK list-profiles. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET() {
  return NextResponse.json({ profiles: MOCK_PROFILES });
}
