import { NextResponse } from "next/server";
import { MOCK_TRIPS } from "@/lib/contract-mock/data";
import type { CreateTripRequest, Trip } from "@/lib/contract-mock/types";

/** MOCK list-trips. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET() {
  return NextResponse.json({ trips: MOCK_TRIPS });
}

/**
 * MOCK create-trip. A new trip starts free + single-day (status draft); the
 * full multi-day experience is unlocked by checkout (BE upgrades on webhook).
 */
export async function POST(request: Request) {
  let body: CreateTripRequest;
  try {
    body = (await request.json()) as CreateTripRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.destination) {
    return NextResponse.json({ error: "destination is required" }, { status: 422 });
  }
  const now = new Date();
  const id = `t_${Math.random().toString(36).slice(2, 8)}`;
  const trip: Trip = {
    id,
    destination: body.destination,
    start_date: body.start_date,
    end_date: body.end_date,
    timezone: body.timezone ?? "UTC",
    tier: "free",
    status: "draft",
    retention_expires_at: new Date(now.getTime() + 365 * 24 * 3600 * 1000).toISOString(),
  };
  return NextResponse.json(trip, { status: 201 });
}
