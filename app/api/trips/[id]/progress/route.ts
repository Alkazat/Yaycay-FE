import { NextResponse } from "next/server";
import { getProgress, updateProgress } from "@/lib/contract-mock/progressStore";
import type { ProgressUpdateRequest, TripProgressResponse } from "@/lib/contract-mock/types";

/** MOCK per-profile progress. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profileId = new URL(request.url).searchParams.get("profile_id");
  if (!profileId) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 422 });
  }
  const res: TripProgressResponse = { progress: [getProgress(id, profileId)] };
  return NextResponse.json(res);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: Partial<ProgressUpdateRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.profile_id) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 422 });
  }
  const updated = updateProgress(id, body.profile_id, {
    active_mode: body.active_mode,
    done_items: body.done_items,
    mark_done: body.mark_done,
    mark_undone: body.mark_undone,
  });
  const res: TripProgressResponse = { progress: [updated] };
  return NextResponse.json(res);
}
