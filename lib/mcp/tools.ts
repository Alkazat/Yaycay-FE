/**
 * Yaycay MCP tools. Each tool is a thin, scope-gated wrapper over the Yaycay
 * contract, executed with the connected parent's identity (see contractFetch).
 *
 * Read tools require the `yaycay.read` scope; the planner requires `yaycay.plan`.
 *
 * Every tool body runs through `safe`, which checks scope and - crucially -
 * turns failures into warm, on-brand guidance the assistant can relay verbatim
 * (never a raw 500). The product's restrictions live here too: trips are
 * created/bought in the Yaycay app, not through this connector, so a request for
 * a new destination returns friendly steps + a dashboard link rather than
 * erroring.
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { contractFetch, contractJson, ContractError } from "@/lib/mcp/contractFetch";
import { SCOPES } from "@/lib/mcp/config";
import { env } from "@/lib/env";

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

/** A friendly, missing-scope error that reads well when relayed to the family. */
class ScopeError extends Error {}

function requireScope(auth: ToolAuth, scope: string): void {
  if (!auth.scopes.includes(scope)) {
    const what = scope === SCOPES.plan ? "make changes or plan" : "read your trips";
    throw new ScopeError(
      `This Yaycay connection isn't set up to ${what} yet. Reconnect Yaycay from your assistant's settings and allow the planning permission, then we can pick up where we left off.`,
    );
  }
}

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };

function ok(data: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function say(text: string, isError = false): ToolResult {
  return { content: [{ type: "text", text }], isError };
}

/** Where the family adds / buys a trip. */
function dashboardUrl(auth: ToolAuth): string {
  return `${auth.origin || env.siteUrl.replace(/\/$/, "")}/trips`;
}

/** Map any thrown error to warm, on-brand, actionable text (never a raw 500). */
function brand(err: unknown, auth: ToolAuth): ToolResult {
  const dash = dashboardUrl(auth);
  if (err instanceof ScopeError) return say(err.message, true);
  if (err instanceof ContractError) {
    if (err.status === 404) {
      return say(
        `I couldn't find that trip on your Yaycay account. New trips are set up in the Yaycay app - that's where the trip and its memories live. Open your dashboard to add one: ${dash}  Once it's there, tell me the destination and we'll start building it together.`,
        true,
      );
    }
    if (err.status === 401) {
      return say(
        `Your Yaycay connection's sign-in has expired. Please reconnect Yaycay from your assistant's settings, then we can carry on right where we left off.`,
        true,
      );
    }
    if (err.status === 403) {
      return say(
        `Yaycay couldn't authorise that on your account. If it keeps happening, try reconnecting Yaycay from your assistant's settings.`,
        true,
      );
    }
    if (err.status === 429) {
      return say(
        `We've reached today's planning limit for this trip (about 10 updates a day, so every change stays considered). Let's continue tomorrow, or carry on in the Yaycay app: ${dash}`,
        true,
      );
    }
    if (err.status >= 500) {
      return say(
        `Yaycay's planner had a brief hiccup just then - please try that again in a moment. If it keeps happening, you can always plan in the app: ${dash}`,
        true,
      );
    }
    return say(
      `Yaycay couldn't complete that just now. Mind trying again, or doing it in the app: ${dash}`,
      true,
    );
  }
  return say(`Something went sideways on Yaycay's side - please try that again in a moment.`, true);
}

/** Run a tool body with scope-check + on-brand error mapping. */
async function safe(
  extra: unknown,
  scope: string | null,
  fn: (auth: ToolAuth) => Promise<ToolResult>,
): Promise<ToolResult> {
  const auth = authFrom(extra);
  try {
    if (scope) requireScope(auth, scope);
    return await fn(auth);
  } catch (err) {
    return brand(err, auth);
  }
}

/** Drain a `text/event-stream` planning reply into one aggregated string. */
async function drainPlanStream(res: Response): Promise<string> {
  if (!res.ok || !res.body) throw new ContractError(res.status, "/plan/chat", "POST");
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
    "List the family's Yaycay trips (id, destination, dates, tier, status). Call this first to see what already exists.",
    {},
    async (_args, extra) =>
      safe(extra, SCOPES.read, async (auth) => {
        const data = await contractJson<{ trips: unknown[] }>("/trips", auth);
        return ok(data.trips);
      }),
  );

  server.tool(
    "get_trip",
    "Get a single trip record: status, tier, dates and memory-retention info.",
    { trip_id: z.string().describe("The trip id, e.g. from list_trips.") },
    async ({ trip_id }, extra) =>
      safe(extra, SCOPES.read, async (auth) =>
        ok(await contractJson(`/trips/${encodeURIComponent(trip_id)}`, auth)),
      ),
  );

  server.tool(
    "get_trip_content",
    "Get the full day-by-day content for a trip (days, moments, activities).",
    { trip_id: z.string().describe("The trip id.") },
    async ({ trip_id }, extra) =>
      safe(extra, SCOPES.read, async (auth) =>
        ok(await contractJson(`/trips/${encodeURIComponent(trip_id)}/content`, auth)),
      ),
  );

  server.tool(
    "get_packing_list",
    "Get the packing lists for a trip.",
    { trip_id: z.string().describe("The trip id.") },
    async ({ trip_id }, extra) =>
      safe(extra, SCOPES.read, async (auth) =>
        ok(await contractJson(`/trips/${encodeURIComponent(trip_id)}/packing`, auth)),
      ),
  );

  server.tool(
    "get_trip_brief",
    "Get the planning brief for a trip: the trip header plus the family's travellers (names, ages, interests) so you can plan to THIS family. Call this (with list_trips) before planning. Note: dietary and medical details are NOT shared through the connector - if they could affect plans, ask the family directly.",
    { trip_id: z.string().describe("The trip id (see list_trips).") },
    async ({ trip_id }, extra) =>
      safe(extra, SCOPES.read, async (auth) => {
        type ProfileRow = { name?: string; age?: number | null; interests?: string[] };
        const [trip, raw] = await Promise.all([
          contractJson<Record<string, unknown>>(`/trips/${encodeURIComponent(trip_id)}`, auth),
          contractJson<{ profiles?: ProfileRow[] } | ProfileRow[]>("/profiles", auth),
        ]);
        const list = Array.isArray(raw) ? raw : (raw.profiles ?? []);
        // Minimise to low-sensitivity planning fields - never export dietary or
        // medical off-platform (mirrors the BE brief; BE migration/PR #90).
        const travellers = list.map((p) => ({
          name: p.name ?? "",
          ...(typeof p.age === "number" ? { age: p.age } : {}),
          interests: p.interests ?? [],
        }));
        return ok({
          trip,
          travellers,
          note: "Plan warmly to this family and trip. Dietary and medical details aren't shared through the connector - if they could affect food or activity choices, ask the family directly.",
        });
      }),
  );

  server.tool(
    "whats_nearby",
    "Yaycay's pre-curated 'what's nearby' companion ideas for a trip (places worth a look + rainy-day backups). Use it to surface things to do near the family, then add a couple of proactive, age-appropriate ideas of your own.",
    { trip_id: z.string().describe("The trip id (see list_trips).") },
    async ({ trip_id }, extra) =>
      safe(extra, SCOPES.read, async (auth) => {
        const nearby = await contractJson(
          `/trips/${encodeURIComponent(trip_id)}/companion`,
          auth,
        );
        return ok({
          nearby,
          note: "A warm starting point - now proactively offer 1-2 more ideas the whole family would enjoy (something for the kids, something shared) plus a rainy-day backup.",
        });
      }),
  );

  server.tool(
    "request_new_trip",
    "Use when the family wants a NEW destination that isn't in their trips yet. Trips can't be created through this connector - they're added in the Yaycay app - so this returns the friendly steps + the family's dashboard link. Relay it warmly and pause planning until they confirm the trip is added.",
    { destination: z.string().describe("Where the family wants to go, e.g. 'Gold Coast'.") },
    async ({ destination }, extra) =>
      safe(extra, null, async (auth) => {
        const dash = dashboardUrl(auth);
        return ok({
          can_create_here: false,
          destination,
          message: `Love it - ${destination} sounds like a great one! New trips are set up in the Yaycay app, where the trip and its memories live. Pop over to your dashboard to add ${destination}: ${dash}  As soon as it's there, tell me and we'll start building your day-by-day plan together.`,
          dashboard_url: dash,
          next_step: `After the family adds "${destination}" in the app, call list_trips to pick it up, then plan_trip to build it.`,
        });
      }),
  );

  server.tool(
    "plan_trip",
    "Ask the Yaycay planner to help shape an EXISTING trip. Returns the planner's reply. For a brand-new destination, use request_new_trip instead.",
    {
      trip_id: z.string().describe("The trip id to plan (must already exist; see list_trips)."),
      message: z.string().describe("What you want help with, in plain language."),
    },
    async ({ trip_id, message }, extra) =>
      safe(extra, SCOPES.plan, async (auth) => {
        // Confirm the trip exists first, so a missing/new destination returns the
        // friendly "add it in the app" guidance (brand's 404 case) rather than a
        // planner 500.
        await contractJson(`/trips/${encodeURIComponent(trip_id)}`, auth);
        // Mark the call as connector-sourced so BE can log it to ai_jobs, count
        // it against the daily cap, and route the written content through Content
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
      }),
  );
}

/** A prompt message in Yaycay's voice for the connecting assistant to run. */
function promptText(text: string) {
  return { messages: [{ role: "user" as const, content: { type: "text" as const, text } }] };
}

/**
 * Branded, one-click flows the family can pick inside their AI client. Prompts
 * are how the Yaycay *experience* (not just the API) shows up in Claude / Gemini
 * / ChatGPT: each encodes the house style and the worldview so "plan a day"
 * needs no re-explaining.
 */
export function registerYaycayPrompts(server: McpServer): void {
  server.prompt(
    "plan_a_day",
    "Plan one day of the trip in Yaycay's style - relaxed, age-appropriate, something for everyone.",
    {
      trip_id: z.string().optional().describe("Trip id (see list_trips)."),
      focus: z.string().optional().describe("Optional focus, e.g. 'beach' or 'dinosaurs'."),
    },
    ({ trip_id, focus }) =>
      promptText(
        `Help me plan a day for our Yaycay trip${trip_id ? ` (${trip_id})` : ""}.\n` +
          `Start with get_trip_brief (who's travelling) and get_trip_content (what's already there).\n` +
          `Then shape ONE relaxed, realistic day: a few great moments, paced for kids, with a clear win for each child, for the grown-ups, and for time together${focus ? `, leaning into ${focus}` : ""}.\n` +
          `Bring the yay - warm, specific, never generic. Add 1-2 proactive touches: a nearby gem (whats_nearby), a rainy-day backup, and a "did you know" the kids will love.`,
      ),
  );

  server.prompt(
    "something_for_everyone",
    "Check the trip so each child, each grown-up, and shared time all get a win - and fix any lopsided day.",
    { trip_id: z.string().optional().describe("Trip id (see list_trips).") },
    ({ trip_id }) =>
      promptText(
        `Review our Yaycay trip${trip_id ? ` (${trip_id})` : ""} through Yaycay's lens: does everyone get something they'll love?\n` +
          `Use get_trip_brief + get_trip_content. For each day, check there's a moment for the kids, a moment for the grown-ups, and a shared one.\n` +
          `Call out any day that's lopsided and suggest one small, upbeat tweak so nobody's left out. Keep it positive and specific.`,
      ),
  );

  server.prompt(
    "whats_nearby",
    "Surface great things to do nearby for the family, with a rainy-day backup.",
    {
      trip_id: z.string().optional().describe("Trip id (see list_trips)."),
      day: z.string().optional().describe("Optional day to focus on."),
    },
    ({ trip_id, day }) =>
      promptText(
        `Show us great things to do nearby on our Yaycay trip${trip_id ? ` (${trip_id})` : ""}${day ? `, around ${day}` : ""}.\n` +
          `Call whats_nearby for Yaycay's curated ideas and get_trip_content for context, then proactively add a couple of age-appropriate, low-faff suggestions the whole family would enjoy - and a rainy-day alternative. Positive and practical.`,
      ),
  );

  server.prompt(
    "rainy_day",
    "Pivot a day to a fun indoor plan, keeping spirits high.",
    {
      trip_id: z.string().optional().describe("Trip id (see list_trips)."),
      day: z.string().optional().describe("Optional day it might rain."),
    },
    ({ trip_id, day }) =>
      promptText(
        `Rain's looking likely${day ? ` on ${day}` : ""} for our Yaycay trip${trip_id ? ` (${trip_id})` : ""} - help us pivot to something cosy and memorable.\n` +
          `Use whats_nearby (rain_plan) and get_trip_content. Keep spirits high and suggest an indoor plan everyone - kids and grown-ups - will still enjoy.`,
      ),
  );
}
