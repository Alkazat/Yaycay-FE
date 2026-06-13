import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type {
  ByoConnectorRequest,
  ByoConnectorResponse,
  Connector,
  ConnectorsListResponse,
} from "@/lib/contract-mock/types";

/**
 * Issue a scoped BYO-AI MCP connector for a trip (`POST /connectors/byo-ai`,
 * tier=byo). Returns the token + MCP URL the parent adds to their own AI.
 */
export async function createByoConnector(
  req: ByoConnectorRequest,
): Promise<ByoConnectorResponse> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/connectors/byo-ai", SERVED.connectors, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
    accessToken,
  });
  if (!res.ok) throw new Error(`Failed to create connector (${res.status})`);
  return (await res.json()) as ByoConnectorResponse;
}

/** List the account's connectors (`GET /connectors`). */
export async function listConnectors(signal?: AbortSignal): Promise<Connector[]> {
  const accessToken = await getAccessToken();
  const res = await apiFetch("/connectors", SERVED.connectors, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load connectors (${res.status})`);
  return ((await res.json()) as ConnectorsListResponse).connectors;
}
