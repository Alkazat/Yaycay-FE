import { NextResponse } from "next/server";
import { getChecklist, setChecklistItem } from "@/lib/contract-mock/checklistStore";

/** MOCK persisted grown-ups booking checklist. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ items: getChecklist(id) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: { item_id?: string; done?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.item_id || typeof body.done !== "boolean") {
    return NextResponse.json({ error: "item_id and done are required" }, { status: 422 });
  }
  return NextResponse.json({ items: setChecklistItem(id, body.item_id, body.done) });
}
