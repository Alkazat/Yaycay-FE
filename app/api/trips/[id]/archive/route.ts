import { NextResponse } from "next/server";
import { archiveMockTrip } from "@/lib/contract-mock/data";

/** MOCK archive/restore a trip. Active until NEXT_PUBLIC_API_BASE + SERVED.archiveTrip. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let archived = true;
  try {
    const body = (await request.json()) as { archived?: boolean };
    if (typeof body.archived === "boolean") archived = body.archived;
  } catch {
    // default to archiving
  }
  const trip = archiveMockTrip(id, archived);
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json(trip);
}
