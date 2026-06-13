import { NextResponse } from "next/server";
import { getChecklist, setChecklistItem } from "@/lib/contract-mock/checklistStore";
import type { ChecklistResponse, ChecklistUpdateRequest } from "@/lib/contract-mock/types";

/** MOCK persisted grown-ups booking checklist (tick state keyed by `item`). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res: ChecklistResponse = { items: getChecklist(id) };
  return NextResponse.json(res);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: ChecklistUpdateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Accept a single `{ item, checked }` or a batch via `items`.
  const updates =
    body.items ??
    (body.item != null && typeof body.checked === "boolean"
      ? [{ item: body.item, checked: body.checked }]
      : null);
  if (!updates || updates.length === 0) {
    return NextResponse.json(
      { error: "item + checked (or items[]) are required" },
      { status: 422 },
    );
  }

  let items = getChecklist(id);
  for (const u of updates) items = setChecklistItem(id, u.item, u.checked);
  const res: ChecklistResponse = { items };
  return NextResponse.json(res);
}
