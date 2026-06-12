import { NextResponse } from "next/server";
import type { TwoFactorVerifyRequest } from "@/lib/contract-mock/types";

/** MOCK second-factor verify. Accepts any 6-digit code. */
export async function POST(request: Request) {
  let body: Partial<TwoFactorVerifyRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const verified = /^\d{6}$/.test(body.code ?? "");
  return NextResponse.json({ verified }, { status: verified ? 200 : 422 });
}
