import { NextResponse } from "next/server";
import { removeMember } from "@/lib/contract-mock/membersStore";

/**
 * MOCK: remove a profile from a trip's roster.
 * DELETE /trips/:id/members/:profileId  → 204 No Content
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; profileId: string }> },
) {
  const { id, profileId } = await params;
  removeMember(id, profileId);
  return new NextResponse(null, { status: 204 });
}
