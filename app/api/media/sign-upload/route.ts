import { NextResponse } from "next/server";
import type { MediaSignRequest } from "@/lib/contract-mock/types";

/**
 * MOCK signed-upload creator. The real BE returns a short-lived Storage signed
 * URL; the client PUTs the compressed photo there and keeps the `media_ref`.
 * Here we return a placeholder upload URL so the flow can be exercised; real
 * persistence/display needs the BE media endpoints.
 */
export async function POST(request: Request) {
  let body: Partial<MediaSignRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.trip_id) {
    return NextResponse.json({ error: "trip_id is required" }, { status: 422 });
  }
  const ref = `media_${Math.random().toString(36).slice(2, 10)}`;
  return NextResponse.json({ upload_url: `/api/media/mock-put/${ref}`, media_ref: ref });
}
