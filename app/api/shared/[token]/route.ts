import { NextResponse } from "next/server";
import { getMockSharedTrip } from "@/lib/contract-mock/data";

/** MOCK resolve a share token to its read-only trip. Active until SERVED.sharedTrip. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const shared = getMockSharedTrip(token);
  if (!shared) return NextResponse.json({ error: "Shared trip not found" }, { status: 404 });
  return NextResponse.json(shared);
}
