import { NextResponse } from "next/server";
import { MOCK_PROFILES } from "@/lib/contract-mock/data";

/** The seeded mock PIN for the parent/carer profile. Live BE verifies a hash. */
const MOCK_PIN = "1234";

/** MOCK PIN verify. Active until NEXT_PUBLIC_API_BASE is set. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = MOCK_PROFILES.find((p) => p.id === id);
  if (!profile) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Profile not found." } },
      { status: 404 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { pin?: unknown };
  const pin = typeof body.pin === "string" ? body.pin : "";
  const ok = profile.type === "parent_carer" && profile.pin_set && pin === MOCK_PIN;
  return NextResponse.json({
    ok,
    attempts_remaining: ok ? 5 : 4,
    locked_until: null,
  });
}
