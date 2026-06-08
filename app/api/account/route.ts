import { NextResponse } from "next/server";
import { MOCK_ACCOUNT } from "@/lib/contract-mock/data";

/** MOCK account summary. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET() {
  return NextResponse.json(MOCK_ACCOUNT);
}
