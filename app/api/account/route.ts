import { NextResponse } from "next/server";
import { MOCK_ACCOUNT } from "@/lib/contract-mock/data";
import type { AccountProfileUpdate } from "@/lib/api/account";

/** MOCK account summary. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET() {
  return NextResponse.json(MOCK_ACCOUNT);
}

/**
 * MOCK account update: applies the editable profile fields (display name,
 * recovery email) and echoes back the summary. Persists in-memory for the
 * session so the UI reflects the save.
 */
export async function PATCH(request: Request) {
  let body: AccountProfileUpdate;
  try {
    body = (await request.json()) as AccountProfileUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (body.name !== undefined) MOCK_ACCOUNT.name = body.name?.trim() || null;
  if (body.secondary_email !== undefined) {
    MOCK_ACCOUNT.secondary_email = body.secondary_email?.trim() || null;
  }
  return NextResponse.json(MOCK_ACCOUNT);
}
