import { NextResponse } from "next/server";
import { createByoConnector } from "@/lib/contract-mock/connectorStore";
import type { ByoConnectorRequest } from "@/lib/contract-mock/types";

/** MOCK issue BYO-AI connector (`POST /connectors/byo-ai`). */
export async function POST(request: Request) {
  let body: ByoConnectorRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.trip_id) {
    return NextResponse.json({ error: "trip_id is required" }, { status: 422 });
  }
  return NextResponse.json(createByoConnector(body.trip_id, body.label), { status: 201 });
}
