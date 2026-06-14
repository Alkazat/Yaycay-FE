import { NextResponse } from "next/server";
import { getMockChatHistory } from "@/lib/contract-mock/data";

/** MOCK reopenable chat history (`GET /trips/:id/chat`). Active until the API base is set. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ messages: getMockChatHistory(id) });
}
