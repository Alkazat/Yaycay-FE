import { NextResponse } from "next/server";
import { setPin } from "@/lib/contract-mock/profileStore";
import type { ProfilePinSetRequest } from "@/lib/contract-mock/types";

/** Mock guardian PIN set/change (`POST /profiles/:id/pin`). Write-only. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: ProfilePinSetRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!/^\d{4}$/.test(body.pin ?? "")) {
    return NextResponse.json({ error: "pin must be 4 digits" }, { status: 422 });
  }
  const updated = setPin(id, body.pin);
  if (!updated) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  // Echo the updated profile (with pin_set:true); the PIN itself is never returned.
  return NextResponse.json(updated);
}
