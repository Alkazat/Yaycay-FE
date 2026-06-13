import { NextResponse } from "next/server";
import { deleteProfile, updateProfile } from "@/lib/contract-mock/profileStore";
import type { ChildProfileInput } from "@/lib/contract-mock/types";

/** MOCK update-profile (`PATCH /profiles/:id`). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: ChildProfileInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const updated = updateProfile(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

/** MOCK delete-profile (`DELETE /profiles/:id`). */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!deleteProfile(id)) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
