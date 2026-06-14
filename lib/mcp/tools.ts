/**
 * Yaycay MCP tools. Each tool is a thin, scope-gated wrapper over the Yaycay
 * contract, executed with the connected parent's identity (see contractFetch).
 *
 * Read tools require the `yaycay.read` scope; the planner requires `yaycay.plan`.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { contractFetch, contractJson } from "@/lib/mcp/contractFetch";
import { SCOPES } from "@/lib/mcp/config";

/** What `withMcpAuth` hands each tool via `extra.authInfo`. */
export interface ToolAuth {
  origin: string;
  accessToken: string;
  scopes: string[];
  connectionId: string;
}

function authFrom(extra: unknown): ToolAuth {
  const info = (extra as { authInfo?: { scopes?: string[]; extra?: Record<string, unknown> } })
    ?.authInfo;
  const ctx = info?.extra ?? {};
  return {
    origin: String(ctx.origin ?? ""),
    accessToken: String(ctx.accessToken ?? ""),
    scopes: info?.scopes ?? [],
    connectionId: String(ctx.connectionId ?? ""),
  };
}

function requireScope(auth: ToolAuth, scope: string): void {
  if (!auth.scopes.includes(scope)) {
    throw new Error(`This connector is missing the "${scope}" scope for that action.`);
  }
}

function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

/** Drain a `text/event-stream` planning reply into one aggregated string. */
async function drainPlanStream(res: Response): Promise<string> {
  if (!res.ok || !res.body) throw new Error(`Planner failed (${res.status})`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = line.slice(line.indexOf(":") + 1).trim();
      if (payload === "[DONE]") return text;
      try {
        const ev = JSON.parse(payload) as Record<string, unknown>;
        if ("error" in ev) throw new Error(String(ev.error));
        if ("delta" in ev) text += String(ev.delta);
      } catch {
        // ignore malformed frame
      }
    }
  }
  return text;
}

/** Register every Yaycay tool on the given MCP server instance. */
export function registerYaycayTools(server: McpServer): void {
  server.tool(
    "list_trips",
    "List the family's Yaycay trips (id, destination, dates, tier, status).",
    {},
    async (_args, extra) => {
      const auth = authFrom(extra);
      requireScope(auth, SCOPES.read);
      const data = await contractJson<{ trips: unknown[] }>("/trips", auth);
      return ok(data.trips);
    },
  );

  server.tool(
    "get_trip",
    "Get a single trip record: status, tier, dates and memory-retention info.",
    { trip_id: z.string().describe("The trip id, e.g. from list_trips.") },
    async ({ trip_id }, extra) => {
      const auth = authFrom(extra);
      requireScope(auth, SCOPES.read);
      return ok(await contractJson(`/trips/${encodeURIComponent(trip_id)}`, auth));
    },
  );

  server.tool(
    "get_trip_content",
    "Get the full day-by-day content for a trip (days, moments, activities).",
    { trip_id: z.string().describe("The trip id.") },
    async ({ trip_id }, extra) => {
      const auth = authFrom(extra);
      requireScope(auth, SCOPES.read);
      return ok(await contractJson(`/trips/${encodeURIComponent(trip_id)}/content`, auth));
    },
  );

  server.tool(
    "get_packing_list",
    "Get the packing lists for a trip.",
    { trip_id: z.string().describe("The trip id.") },
    async ({ trip_id }, extra) => {
      const auth = authFrom(extra);
      requireScope(auth, SCOPES.read);
      return ok(await contractJson(`/trips/${encodeURIComponent(trip_id)}/packing`, auth));
    },
  );

  server.tool(
    "plan_trip",
    "Ask the Yaycay planner to help shape a trip. Returns the planner's reply.",
    {
      trip_id: z.string().describe("The trip id to plan."),
      message: z.string().describe("What you want help with, in plain language."),
    },
    async ({ trip_id, message }, extra) => {
      const auth = authFrom(extra);
      requireScope(auth, SCOPES.plan);
      // Mark the call as connector-sourced so BE can log it to ai_jobs, count it
      // against the daily cap, and route the written content through Content
      // Review (an external model has no built-in guardrail). See handoff #08.
      const res = await contractFetch(`/trips/${encodeURIComponent(trip_id)}/plan/chat`, {
        ...auth,
        method: "POST",
        body: { messages: [{ role: "user", content: message }] },
        headers: {
          "x-yaycay-source": "connector",
          "x-yaycay-connection-id": auth.connectionId,
        },
      });
      const reply = await drainPlanStream(res);
      return ok({ reply });
    },
  );
}
