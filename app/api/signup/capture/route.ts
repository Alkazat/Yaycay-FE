import { NextResponse } from "next/server";
import type { SignupCaptureRequest } from "@/lib/contract-mock/types";

/** MOCK signup capture. Active until NEXT_PUBLIC_API_BASE is set. */
export async function POST(request: Request) {
  let body: Partial<SignupCaptureRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.email) {
    return NextResponse.json({ error: "email is required" }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
