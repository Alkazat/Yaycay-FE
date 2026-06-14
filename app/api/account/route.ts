import { NextResponse } from "next/server";
import { MOCK_ACCOUNT } from "@/lib/contract-mock/data";
import type { AccountUpdate } from "@/lib/contract-mock/types";

/** MOCK account summary. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET() {
  return NextResponse.json(MOCK_ACCOUNT);
}

/** MOCK account update: echoes back the summary with the recovery email applied. */
export async function PATCH(request: Request) {
  let body: AccountUpdate;
  try {
    body = (await request.json()) as AccountUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const secondary = body.secondary_email;
  const next = {
    ...MOCK_ACCOUNT,
    secondary_email: secondary === undefined ? MOCK_ACCOUNT.secondary_email : secondary || null,
  };
  return NextResponse.json(next);
}
