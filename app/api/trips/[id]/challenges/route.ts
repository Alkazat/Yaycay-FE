import { NextResponse } from "next/server";
import type { ChallengesResponse } from "@/lib/contract-mock/types";

/** MOCK per-child challenges. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profile");

  const now = new Date().toISOString();

  const allChallenges: ChallengesResponse["challenges"] = [
    {
      id: "ch_1",
      trip_id: id,
      profile_id: "profile_child_1",
      day: "day_1",
      node_ref: "moment_1",
      kind: "quiz",
      prompt: "What is the capital of the country you are visiting?",
      answer: "Bangkok",
      options: ["Bangkok", "Kuala Lumpur", "Singapore", "Jakarta"],
      stars: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: "ch_2",
      trip_id: id,
      profile_id: "profile_child_1",
      day: "day_2",
      node_ref: "moment_3",
      kind: "spot",
      prompt: "Spot a tuk-tuk and take a photo!",
      answer: null,
      options: [],
      stars: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: "ch_3",
      trip_id: id,
      profile_id: "profile_child_2",
      day: "day_1",
      node_ref: "moment_2",
      kind: "photo",
      prompt: "Take a photo of the temple entrance.",
      answer: null,
      options: [],
      stars: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: "ch_4",
      trip_id: id,
      profile_id: "profile_child_2",
      day: "day_3",
      node_ref: "moment_5",
      kind: "challenge",
      prompt: "Count how many elephants you see today.",
      answer: null,
      options: [],
      stars: 3,
      created_at: now,
      updated_at: now,
    },
  ];

  const challenges = profileId
    ? allChallenges.filter((c) => c.profile_id === profileId)
    : allChallenges;

  return NextResponse.json({ challenges } satisfies ChallengesResponse);
}
