import { NextResponse } from "next/server";
import { createProfile, listProfiles } from "@/lib/contract-mock/profileStore";
import type { ChildProfileInput } from "@/lib/contract-mock/types";

/** MOCK list-profiles. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET() {
  return NextResponse.json({ profiles: listProfiles() });
}

/** MOCK create-profile (`POST /profiles`). */
export async function POST(request: Request) {
  let body: ChildProfileInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 422 });
  }
  return NextResponse.json(createProfile(body), { status: 201 });
}
