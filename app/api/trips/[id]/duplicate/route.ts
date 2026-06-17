import { NextResponse } from "next/server";
import { duplicateMockTrip } from "@/lib/contract-mock/data";

/** MOCK duplicate a trip into a fresh draft. Active until SERVED.duplicateTrip. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const trip = duplicateMockTrip(id);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json(trip, { status: 201 });
}
