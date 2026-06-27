import { NextResponse } from "next/server";
import type { ChallengesResponse } from "@/lib/contract-mock/types";

/**
 * MOCK per-child challenges. Active until NEXT_PUBLIC_API_BASE is set AND
 * the BE has shipped this endpoint (SERVED.challenges flipped to true).
 *
 * Returns an empty challenges array so the content-level `star_challenge`
 * on each day is never suppressed by mock data. Real per-child challenges
 * will come from the live API once BE ships the endpoint.
 */
export async function GET(_request: Request, _context: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ challenges: [] } satisfies ChallengesResponse);
}
