import { NextResponse } from "next/server";
import type { RewardsResponse } from "@/lib/contract-mock/types";

/** MOCK star-to-cash reward configs. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rewards: RewardsResponse = {
    rewards: [
      {
        id: "reward_1",
        trip_id: id,
        profile_id: null,
        star_value: 0.5,
        currency: "AUD",
        star_target: 20,
        star_budget: 10,
        updated_at: new Date().toISOString(),
      },
    ],
  };

  return NextResponse.json(rewards);
}
