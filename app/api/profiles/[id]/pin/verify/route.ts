import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/contract-mock/profileStore";
import type { ProfilePinVerifyRequest, ProfilePinVerifyResponse } from "@/lib/contract-mock/types";

/** Mock guardian PIN verify (`POST /profiles/:id/pin/verify`). Unlocks Grown-ups. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: ProfilePinVerifyRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const ok = verifyPin(id, body.pin ?? "");
  return NextResponse.json({ ok } satisfies ProfilePinVerifyResponse);
}
