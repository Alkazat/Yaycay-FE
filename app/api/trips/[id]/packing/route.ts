import { NextResponse } from "next/server";
import {
  getPacking,
  tickItem,
  addItem,
  deleteItem,
  resetTicks,
} from "@/lib/contract-mock/packingStore";
import type { PackingAction } from "@/lib/contract-mock/types";

/** MOCK packing lists (per profile + family) with tick + CRUD. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ lists: getPacking(id) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: PackingAction;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  switch (body.action) {
    case "tick":
      return NextResponse.json({ lists: tickItem(id, body.list_id, body.item_id, body.checked) });
    case "add":
      if (!body.label?.trim()) {
        return NextResponse.json({ error: "label is required" }, { status: 422 });
      }
      return NextResponse.json({
        lists: addItem(id, body.list_id, body.section_id, body.label.trim(), body.qty),
      });
    case "delete":
      return NextResponse.json({ lists: deleteItem(id, body.list_id, body.item_id) });
    case "reset":
      return NextResponse.json({ lists: resetTicks(id) });
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 422 });
  }
}
