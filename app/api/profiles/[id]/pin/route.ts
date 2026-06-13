import { NextResponse } from "next/server";
import { MOCK_PROFILES } from "@/lib/contract-mock/data";

/**
 * MOCK set-PIN. Active until NEXT_PUBLIC_API_BASE is set. The mock store is
 * static, so this doesn't persist - it just echoes the profile as PIN-enabled.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = MOCK_PROFILES.find((p) => p.id === id);
  if (!profile) {
    return NextResponse.json(
      { error: { code: "not_found", message: "Profile not found." } },
      { status: 404 },
    );
  }
  if (profile.type !== "parent_carer") {
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message: "PIN is only valid for parent/carer profiles.",
        },
      },
      { status: 422 },
    );
  }
  return NextResponse.json({ ...profile, pin_set: true });
}
