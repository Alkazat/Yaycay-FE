import { NextResponse } from "next/server";
import { getMockSharedTrip, duplicateMockTrip } from "@/lib/contract-mock/data";

/**
 * MOCK recipient duplicate-from-share. Resolves the token to its trip and copies
 * it into a fresh draft (as if owned by the recipient). Active until
 * SERVED.sharedTrip routes to the live BE.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const shared = getMockSharedTrip(token);
  if (!shared) return NextResponse.json({ error: "Shared trip not found" }, { status: 404 });
  const copy = duplicateMockTrip(shared.content.trip.id);
  if (!copy) return NextResponse.json({ error: "Shared trip not found" }, { status: 404 });
  return NextResponse.json(copy, { status: 201 });
}
