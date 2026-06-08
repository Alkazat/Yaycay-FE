import { NextResponse } from "next/server";
import { getMockTrip } from "@/lib/contract-mock/data";

/** MOCK get-trip. Returns the full TripContent payload for a trip id. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const trip = getMockTrip(id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  return NextResponse.json(trip);
}
