import { NextResponse } from "next/server";
import { getMockTripRecord } from "@/lib/contract-mock/data";

/** MOCK get-trip record (the row, not the content). Active until live API is set. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const trip = getMockTripRecord(id);
  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  return NextResponse.json(trip);
}
