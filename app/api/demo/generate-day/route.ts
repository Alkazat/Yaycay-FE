import { NextResponse } from "next/server";
import { generateDemoDay } from "@/lib/contract-mock/generateDemoDay";
import type { DemoGenerateDayRequest } from "@/lib/contract-mock/types";

/**
 * MOCK route handler standing in for the BE's `POST /demo/generate-day`.
 * Active only while `NEXT_PUBLIC_API_BASE` is unset. See lib/contract-mock.
 */
export async function POST(request: Request) {
  let body: Partial<DemoGenerateDayRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { destination, start_date, end_date } = body;
  if (!destination || !start_date || !end_date) {
    return NextResponse.json(
      { error: "destination, start_date and end_date are required" },
      { status: 422 },
    );
  }

  const result = generateDemoDay({ destination, start_date, end_date });
  return NextResponse.json(result);
}
