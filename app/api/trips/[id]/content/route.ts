import { NextResponse } from "next/server";
import { getMockTrip } from "@/lib/contract-mock/data";
import type { TripContentPatch } from "@/lib/contract-mock/types";

/** MOCK trip content (the full day-by-day payload). Active until live API is set. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const content = getMockTrip(id);
  if (!content) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  return NextResponse.json(content);
}

/**
 * MOCK content patch. The real BE re-validates and persists the patched content;
 * the mock has no editable store, so it validates the body shape and echoes the
 * current content back. Swap target: BE `PATCH /trips/:id/content`.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const content = getMockTrip(id);
  if (!content) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  let body: Partial<TripContentPatch>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!Array.isArray(body.ops)) {
    return NextResponse.json({ error: "ops[] is required" }, { status: 422 });
  }
  return NextResponse.json(content);
}
