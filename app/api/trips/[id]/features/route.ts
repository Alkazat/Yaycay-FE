import { NextResponse } from "next/server";
import { listFeatures, putFeatures } from "@/lib/contract-mock/featuresStore";
import type { FeaturesUpdateRequest, TripFeaturesResponse } from "@/lib/contract-mock/types";

/** MOCK per-explorer feature toggles. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res: TripFeaturesResponse = { features: listFeatures(id) };
  return NextResponse.json(res);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Partial<FeaturesUpdateRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.profile_id) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 422 });
  }
  // Keep only boolean entries (the toggle vocabulary is open-ended by design).
  const clean: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(body.overrides ?? {})) {
    if (typeof v === "boolean") clean[k] = v;
  }
  return NextResponse.json(putFeatures(id, body.profile_id, clean));
}
