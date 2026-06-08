import { NextResponse } from "next/server";
import { addJournal, listJournal } from "@/lib/contract-mock/journalStore";
import type { JournalEntryInput } from "@/lib/contract-mock/types";

/** MOCK list/create journal entries for a trip. Active until live API is set. */
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

  if (!body.profile_id || !body.day_id) {
    return NextResponse.json(
      { error: "profile_id and day_id are required" },
      { status: 422 },
    );
  }
  if (!body.note && body.stars == null) {
    return NextResponse.json(
      { error: "Add a note or a star rating" },
      { status: 422 },
    );
  }

  const entry = addJournal({
    trip_id: id,
    profile_id: body.profile_id,
    day_id: body.day_id,
    note: body.note,
    stars: body.stars,
  });
  return NextResponse.json(entry, { status: 201 });
}
