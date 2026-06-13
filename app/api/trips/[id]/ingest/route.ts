import { NextResponse } from "next/server";
import { getMockTrip } from "@/lib/contract-mock/data";
import type { IngestRequest } from "@/lib/contract-mock/types";

/**
 * MOCK ingest. The real BE runs a vision/AI harness and patches the content;
 * the mock validates the request and returns a no-op patch with the current
 * content. Swap target: BE `POST /trips/:id/ingest`.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const content = getMockTrip(id);
  if (!content) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }
  let body: IngestRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.text && !body.image) {
    return NextResponse.json({ error: "text or image is required" }, { status: 422 });
  }
  return NextResponse.json({
    applied: false,
    job_id: null,
    generated_by: "fallback",
    patch: { ops: [], note: "Mock ingest does not modify content." },
    content,
  });
}
