import { NextResponse } from "next/server";
import { shareMockTrip } from "@/lib/contract-mock/data";

/**
 * MOCK share a trip read-only. Mints a token and returns a public link; pretends
 * to email the recipient when an address is given. Active until SERVED.shareTrip.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let email: string | undefined;
  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim() || undefined;
  } catch {
    // no body
  }
  const token = shareMockTrip(id);
  if (!token) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  const origin = new URL(request.url).origin;
  return NextResponse.json({
    share_url: `${origin}/shared/${token}`,
    emailed: !!email,
  });
}
