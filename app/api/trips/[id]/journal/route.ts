import { NextResponse } from "next/server";
import { addJournal, listJournal } from "@/lib/contract-mock/journalStore";
import type { JournalEntryInput } from "@/lib/contract-mock/types";

/** MOCK list/create journal entries for a trip. Used in mock/CI mode. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const profileId = new URL(request.url).searchParams.get("profile_id") ?? undefined;
  return NextResponse.json({ entries: listJournal(id, profileId) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: Partial<JournalEntryInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.profile_id) {
    return NextResponse.json({ error: "profile_id is required" }, { status: 422 });
  }
  const hasContent =
    !!body.body?.trim() ||
    body.stars != null ||
    !!body.mood ||
    (body.media_ref?.length ?? 0) > 0;
  if (!hasContent) {
    return NextResponse.json(
      { error: "Add a note, a mood, a star rating or a photo" },
      { status: 422 },
    );
  }

  const entry = addJournal(id, {
    profile_id: body.profile_id,
    day_id: body.day_id,
    body: body.body,
    stars: body.stars,
    mood: body.mood,
    media_ref: body.media_ref,
  });
  return NextResponse.json(entry, { status: 201 });
}
