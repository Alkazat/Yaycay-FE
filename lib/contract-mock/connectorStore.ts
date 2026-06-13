/**
 * MOCK connectors store - TEMPORARY. Stands in for the BE BYO-AI connector
 * issuance + listing until the live API exists. Module memory; resets on
 * restart. Swap target: BE `POST /connectors/byo-ai`, `GET /connectors`.
 */
import type { ByoConnectorResponse, Connector } from "./types";

const connectors: Connector[] = [];
let seq = 0;

export function listConnectors(): Connector[] {
  return connectors;
}

export function createByoConnector(tripId: string, label?: string): ByoConnectorResponse {
  seq += 1;
  const id = `conn_${seq}`;
  const now = new Date().toISOString();
  connectors.push({
    id,
    trip_id: tripId,
    label: label ?? null,
    scopes: [`trip:${tripId}`],
    status: "active",
    last_used_at: null,
    created_at: now,
  });
  return {
    connector_id: id,
    token: `mcp_mock_${Math.random().toString(36).slice(2, 18)}`,
    mcp_url: "https://nzmjkbjtcjthjwdscjrj.supabase.co/functions/v1/mcp",
  };
}
