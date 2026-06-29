import { NextResponse } from "next/server";
import { listProfiles } from "@/lib/contract-mock/profileStore";
import { getRoster, addMember } from "@/lib/contract-mock/membersStore";
import type { TripMembersResponse } from "@/lib/contract-mock/types";

/**
 * MOCK per-trip member roster. Active until NEXT_PUBLIC_API_BASE is set AND
 * `SERVED.members` is flipped to true.
 *
 * GET  /trips/:id/members   → { members: ChildProfile[] }
 * POST /trips/:id/members   → { members: ChildProfile[] }  201 new / 200 already
 *
 * The mock seeds every trip's roster with the full account family (MOCK_PROFILES)
 * on first access, so the existing e2e tests (cover, trips, active-profile) still
 * find Savy/Tay/Lenny/Mum in the trip picker without any change to those tests.
 *
 * State is module-level (resets on restart), mirroring profileStore.
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const roster = getRoster(id);
  const members = listProfiles().filter((p) => roster.has(p.id));
  return NextResponse.json({ members } satisfies TripMembersResponse);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const profileId = typeof body?.profile_id === "string" ? body.profile_id : null;

  if (!profileId) {
    return NextResponse.json({ error: "profile_id required" }, { status: 400 });
  }

  const allProfiles = listProfiles();
  const profile = allProfiles.find((p) => p.id === profileId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const isNew = addMember(id, profileId);
  const roster = getRoster(id);
  const members = allProfiles.filter((p) => roster.has(p.id));
  return NextResponse.json({ members } satisfies TripMembersResponse, { status: isNew ? 201 : 200 });
}
