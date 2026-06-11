import { NextResponse } from "next/server";
import { claimStar } from "@/lib/contract-mock/starsStore";
import type { StarClaimRequest } from "@/lib/contract-mock/types";

/** MOCK star claim (idempotent per profile per day per source). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Partial<StarClaimRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.profile_id || !body.day_id || !body.source) {
    return NextResponse.json(
      { error: "profile_id, day_id and source are required" },
      { status: 422 },
    );
  }
  return NextResponse.json(claimStar(id, body.profile_id, body.day_id, body.source));
}
