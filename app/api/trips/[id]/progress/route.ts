import { NextResponse } from "next/server";
import { getProgress, setActivityDone } from "@/lib/contract-mock/progressStore";

/** MOCK per-profile progress. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = new URL(request.url).searchParams.get("profile_id");
  if (!profileId) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 422 });
  }
  return NextResponse.json(getProgress(id, profileId));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { profile_id?: string; activity_id?: string; done?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.profile_id || !body.activity_id || typeof body.done !== "boolean") {
    return NextResponse.json(
      { error: "profile_id, activity_id and done are required" },
      { status: 422 },
    );
  }
  return NextResponse.json(setActivityDone(id, body.profile_id, body.activity_id, body.done));
}
