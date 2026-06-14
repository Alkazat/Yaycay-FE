import { NextResponse } from "next/server";
import { getMockCompanion } from "@/lib/contract-mock/data";

/** MOCK companion cards (`GET /trips/:id/companion`). Active until the API base is set. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ cards: getMockCompanion(id) });
}
