import { NextResponse } from "next/server";
import { verifyPin } from "@/lib/contract-mock/profileStore";
import type { PinRequest, PinVerifyResponse } from "@/lib/contract-mock/types";

/** Mock parent/carer PIN verify (`POST /profiles/:id/pin/verify`). Unlocks Grown-ups. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: PinRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const verified = verifyPin(id, body.pin ?? "");
  // Mock does not track attempts; report the cap on success, one short otherwise.
  return NextResponse.json({
    verified,
    attempts_remaining: verified ? 5 : 4,
    locked_until: null,
  } satisfies PinVerifyResponse);
}
