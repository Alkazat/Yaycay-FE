import { NextResponse } from "next/server";
import { listConnectors } from "@/lib/contract-mock/connectorStore";

/** MOCK list-connectors (`GET /connectors`). Active until live API is set. */
export async function GET() {
  return NextResponse.json({ connectors: listConnectors() });
}
