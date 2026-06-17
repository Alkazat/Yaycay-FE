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
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { contractFetch, contractJson, ContractError } from "@/lib/mcp/contractFetch";
import { SCOPES } from "@/lib/mcp/config";
import { fetchNearbyPlaces } from "@/lib/mcp/places";
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

/**
 * A branded SUCCESS for write tools: a warm, in-voice confirmation the assistant
 * can relay verbatim, followed by the saved data. Reads keep returning raw data
 * (`ok`) - the brand voice for those lives in the instructions and resources.
 */
function done(message: string, data: unknown): ToolResult {
  return { content: [{ type: "text", text: `${message}\n\n${JSON.stringify(data, null, 2)}` }] };
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

/** Apply structured edit ops to the saved itinerary (persists via the BE). */
async function applyTripOps(auth: ToolAuth, tripId: string, ops: unknown[]): Promise<ToolResult> {
  const content = await contractJson(`/trips/${encodeURIComponent(tripId)}/content/patch`, {
    ...auth,
    method: "POST",
    body: { ops },
    headers: { "x-yaycay-source": "connector", "x-yaycay-connection-id": auth.connectionId },
  });
  return done(
    "Saved to your Yaycay trip - it'll show up everywhere the family looks, no copying needed. Want to keep shaping it?",
    { saved: true, content },
  );
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

/**
 * Pick a child's explorer band from their age, mirroring the USER-TYPES handoff
 * (Little under ~6, Explorer ~7-11, Big Explorer ~12+). Defaults to the middle
 * band when no age is given, so a name-only create still lands somewhere sensible.
 */
function bandForAge(age?: number): "little" | "explorer" | "explorer_plus" {
  if (typeof age !== "number") return "explorer";
  if (age <= 6) return "little";
  if (age <= 11) return "explorer";
  return "explorer_plus";
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
    "get_trip_content",
    "Get the full day-by-day content for a trip (days, moments, activities).",
    { trip_id: z.string().describe("The trip id.") },
    async ({ trip_id }, extra) =>
      safe(extra, SCOPES.read, async (auth) =>
        ok(await contractJson(`/trips/${encodeURIComponent(trip_id)}/content`, auth)),
      ),
  );

  server.tool(
    "get_trip_brief",
    "The whole picture for a trip in ONE call - your starting point. Returns the trip header, the family's travellers (names, ages, interests), the saved brief (pace/interests/must-dos/avoids), the tracked bookings, the packing lists, and an outline of the plan so far (days + how full each is). Call this (with list_trips) before planning; pull get_trip_content when you need the full day-by-day to edit it. Note: dietary and medical details are NOT shared through the connector - if they could affect plans, ask the family directly.",
    { trip_id: z.string().describe("The trip id (see list_trips).") },
    async ({ trip_id }, extra) =>
      safe(extra, SCOPES.read, async (auth) => {
        type ProfileRow = { name?: string; age?: number | null; interests?: string[] };
        type DayRow = { id?: string; label?: string; date?: string; moments?: unknown[] };
        const id = encodeURIComponent(trip_id);
        // The trip header + travellers + brief are core (an error here should
        // brand as "add it in the app"). Bookings / packing / content are
        // secondary context, so a hiccup there shouldn't sink the whole brief.
        const [trip, raw, intentRes, content, reservations, packing] = await Promise.all([
          contractJson<Record<string, unknown>>(`/trips/${id}`, auth),
          contractJson<{ profiles?: ProfileRow[] } | ProfileRow[]>("/profiles", auth),
          contractJson<{ intent?: unknown }>(`/trips/${id}/intent`, auth),
          contractJson<{ days?: DayRow[] } | DayRow[]>(`/trips/${id}/content`, auth).catch(
            () => null,
          ),
          contractJson<unknown>(`/trips/${id}/reservations`, auth).catch(() => null),
          contractJson<unknown>(`/trips/${id}/packing`, auth).catch(() => null),
        ]);
        const list = Array.isArray(raw) ? raw : (raw.profiles ?? []);
        // Minimise the account profiles to low-sensitivity fields - never export
        // dietary or medical off-platform (mirrors the BE brief; PR #90). The
        // family's own trip brief (intent) is included as-is: they authored it.
        const travellers = list.map((p) => ({
          name: p.name ?? "",
          ...(typeof p.age === "number" ? { age: p.age } : {}),
          interests: p.interests ?? [],
        }));
        const days = Array.isArray(content) ? content : (content?.days ?? []);
        const plan_outline = days.map((d) => ({
          day: d.label ?? d.date ?? d.id ?? "",
          moments: Array.isArray(d.moments) ? d.moments.length : 0,
        }));
        return ok({
          trip,
          travellers,
          intent: intentRes?.intent ?? null,
          reservations: reservations ?? [],
          packing: packing ?? null,
          plan_outline,
          note: "Plan warmly to this family and trip. Account profiles here omit dietary/medical - if those could affect food or activity choices and aren't already in the brief, ask the family and save them with set_trip_brief.",
        });
      }),
  );

  server.tool(
    "whats_nearby",
    "Yaycay's 'what's nearby' for a trip: curated picks + rainy-day backups, plus live real-world places when a maps source is connected. Lead with these, then layer in your own area knowledge - always through Yaycay's lens.",
    { trip_id: z.string().describe("The trip id (see list_trips).") },
    async ({ trip_id }, extra) =>
      safe(extra, SCOPES.read, async (auth) => {
        const id = encodeURIComponent(trip_id);
        const [curated, trip] = await Promise.all([
          contractJson(`/trips/${id}/companion`, auth),
          contractJson<{ destination?: string }>(`/trips/${id}`, auth),
        ]);
        // Best-effort live layer: real, current places near the destination when
        // a provider is configured; silently absent otherwise (curated still leads).
        const live = await fetchNearbyPlaces(String(trip.destination ?? ""));
        return ok({
          curated,
          live_nearby: live.available ? live.places : [],
          live_source: live.source,
          note: live.available
            ? "Lead with Yaycay's curated picks, then weave in the live_nearby places (current, real-world) and a couple of your own well-judged ideas - something for the kids, something shared - plus a rainy-day backup. Age-appropriate, low-faff."
            : "These are Yaycay's curated picks - lead with them, then add a couple of your own well-judged nearby ideas (something for the kids, something shared) and a rainy-day backup. Keep it age-appropriate and low-faff.",
        });
      }),
  );

  server.tool(
    "add_reservation",
    "Record a booking the family has made (or plans to) onto the trip. This TRACKS it in their itinerary - it does not pay or book with any supplier. Status defaults to 'planned'.",
    {
      trip_id: z.string().describe("The trip id (see list_trips)."),
      title: z.string().describe("What it's for, e.g. 'Sea World tickets' or 'Beachside Hotel'."),
      kind: z.enum(["hotel", "activity", "flight", "transport", "dining", "other"]).optional(),
      when: z.string().optional().describe("When, in plain words, e.g. 'Fri 2pm' or 'day 3'."),
      location: z.string().optional(),
      ref: z.string().optional().describe("Any confirmation / booking reference."),
      status: z.enum(["planned", "booked", "confirmed"]).optional(),
      notes: z.string().optional(),
    },
    async ({ trip_id, ...body }, extra) =>
      safe(extra, SCOPES.plan, async (auth) => {
        // Confirm the trip exists so a new/unknown destination returns the
        // friendly "add it in the app" guidance instead of an FK error.
        await contractJson(`/trips/${encodeURIComponent(trip_id)}`, auth);
        const saved = await contractJson(`/trips/${encodeURIComponent(trip_id)}/reservations`, {
          ...auth,
          method: "POST",
          body,
        });
        return done(
          "Tracked it on your trip! I've just noted it down - no payment, nothing booked on your behalf. Tell me when it's locked in and I'll mark it confirmed.",
          saved,
        );
      }),
  );

  server.tool(
    "confirm_reservation",
    "Mark a tracked reservation as confirmed (optionally with its confirmation reference), once the family has it locked in.",
    {
      trip_id: z.string().describe("The trip id."),
      reservation_id: z.string().describe("The reservation id (see list_reservations)."),
      ref: z.string().optional().describe("Confirmation reference, if any."),
    },
    async ({ trip_id, reservation_id, ref }, extra) =>
      safe(extra, SCOPES.plan, async (auth) => {
        const saved = await contractJson(
          `/trips/${encodeURIComponent(trip_id)}/reservations/${encodeURIComponent(reservation_id)}`,
          { ...auth, method: "PATCH", body: { status: "confirmed", ...(ref ? { ref } : {}) } },
        );
        return done("Locked in! I've marked that one confirmed on your trip.", saved);
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
    "list_explorers",
    "List the family's people - the explorers (children) and grown-ups (parents/carers) who travel and use Yaycay. Returns id, name, kind, age band and age. Call this before create_explorer so you can spot someone who already exists instead of adding a duplicate. Note: dietary/medical details are NOT shared through the connector.",
    {},
    async (_args, extra) =>
      safe(extra, SCOPES.read, async (auth) => {
        const raw = await contractJson<{ profiles?: unknown[] } | unknown[]>("/profiles", auth);
        const list = Array.isArray(raw) ? raw : (raw.profiles ?? []);
        const people = (list as Record<string, unknown>[]).map((p) => ({
          id: p.id,
          name: p.name ?? "",
          kind: p.type === "parent_carer" ? "grown_up" : "child",
          band: (p.mode as string | null) ?? null,
          ...(typeof p.age === "number" ? { age: p.age } : {}),
        }));
        return ok(people);
      }),
  );

  server.tool(
    "create_explorer",
    [
      "Add a new explorer (a child) or grown-up to the family so they can join trips and have their own Yaycay experience. Quick to use - just a name is required.",
      "- kind: 'child' (an explorer) or 'grown_up' (a parent/carer). Defaults to 'child'.",
      "- age: optional; for a child it picks the right band automatically (Little under ~6, Explorer ~7-11, Big Explorer ~12+).",
      "- avatar: optional emoji for their card.",
      "- interests: optional, a few things they love.",
      "Whoever you add shows up everywhere the family looks - no copying needed. Dietary, medical and any login are set later in the Yaycay app, not here.",
    ].join("\n"),
    {
      name: z.string().describe("The person's name, e.g. 'Maya'."),
      kind: z
        .enum(["child", "grown_up"])
        .optional()
        .describe("child (an explorer) or grown_up (a parent/carer). Defaults to child."),
      age: z.number().int().min(0).max(18).optional().describe("A child's age - sets their band."),
      avatar: z.string().optional().describe("An emoji for their card, e.g. '🦊'."),
      interests: z
        .array(z.string())
        .optional()
        .describe("A few things they love, e.g. ['dinosaurs','swimming']."),
    },
    async ({ name, kind, age, avatar, interests }, extra) =>
      safe(extra, SCOPES.plan, async (auth) => {
        const isGrownUp = kind === "grown_up";
        // A grown-up (parent/carer) stores no band: the DB explorer_mode enum is
        // children-only (little|explorer|explorer_plus) and the "standard" voice
        // is derived from type on read. Children get a band from their age.
        const body: Record<string, unknown> = {
          name,
          type: isGrownUp ? "parent_carer" : "child",
        };
        if (!isGrownUp) body.mode = bandForAge(age);
        if (typeof age === "number") body.age = age;
        if (avatar) body.avatar = avatar;
        if (interests && interests.length) body.interests = interests;
        const saved = await contractJson("/profiles", { ...auth, method: "POST", body });
        const who = isGrownUp ? "grown-up" : "explorer";
        return done(
          `Added ${name} as a new ${who}! They're set up across the family now and ready to join the trip. You can fine-tune their details - and add any dietary, medical or sign-in - in the Yaycay app.`,
          saved,
        );
      }),
  );

  server.tool(
    "edit_itinerary",
    [
      "Save structural changes to the trip's day-by-day plan so they PERSIST (not just chat). Pass one or more ops, applied in order:",
      "- {op:'add_day', day:{label, date?}}",
      "- {op:'set_day_summary', day_id, summary}",
      "- {op:'add_moment', day_id, moment:{slot:'morning|midday|afternoon|evening|night|anytime', title}}",
      "- {op:'add_activity', day_id, moment_id, activity:{kind:'kid|shared|adult', title, body?, facts?, safety?, variants?}}",
      "- {op:'update_activity', activity_id, set:{...fields}} (e.g. body for per-person notes, safety for an allergy reminder, variants for a rainy-day alternative)",
      "- {op:'move_activity', activity_id, to_moment_id}",
      "- {op:'set_booking', activity_id, booking:{name, time?}}",
      "ids come from get_trip_content; ids for new items are auto-filled. Yaycay validates the result and queues it for kid-safe review.",
    ].join("\n"),
    {
      trip_id: z.string().describe("The trip id (see list_trips)."),
      ops: z.array(z.record(z.unknown())).describe("The edit ops to apply, in order."),
    },
    async ({ trip_id, ops }, extra) =>
      safe(extra, SCOPES.plan, async (auth) => applyTripOps(auth, trip_id, ops)),
  );

  server.tool(
    "set_trip_brief",
    "Save what the family tells you about the trip into Yaycay's memory (the brief): pace, budget, interests, must-dos, things to avoid, free-form constraints (allergies, dietary needs, meal ideas, nap windows), and the travellers. Only the fields you pass change. This is how the family's words become durable Yaycay data.",
    {
      trip_id: z.string().describe("The trip id (see list_trips)."),
      pace: z.string().optional(),
      budget: z.string().optional(),
      interests: z.array(z.string()).optional(),
      must_do: z.array(z.string()).optional(),
      avoid: z.array(z.string()).optional(),
      notes: z.string().optional(),
      constraints: z
        .record(z.unknown())
        .optional()
        .describe(
          "Free-form, e.g. {allergies:['nuts'], meals:'kid-friendly dinners', nap:'1-3pm'}.",
        ),
      travellers: z
        .array(z.record(z.unknown()))
        .optional()
        .describe("[{name, age?, kind:'kid'|'adult', interests?, dietary?}]"),
    },
    async ({ trip_id, ...patch }, extra) =>
      safe(extra, SCOPES.plan, async (auth) => {
        const saved = await contractJson(`/trips/${encodeURIComponent(trip_id)}/intent`, {
          ...auth,
          method: "PUT",
          body: patch,
        });
        return done(
          "Got it - I'll remember that for this trip. It'll shape every plan from here, so you won't have to tell me twice.",
          saved,
        );
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

/** The Yaycay "front door" - house style + how to plan, surfaced as a resource. */
const WELCOME = [
  "# Welcome to Yaycay",
  "",
  "I'm Yaycay - your family-holiday companion. I help you plan, book and enjoy",
  "trips the whole family will remember. Warm, upbeat, a little playful, and",
  "always proactive. Let's bring the yay.",
  "",
  "## What I hold in mind",
  "- **For you (the parent):** make it easy and low-stress - I'll do the thinking.",
  "- **For each kid:** age-appropriate wonder - something every child lights up about.",
  "- **For together:** shared moments that bond the family.",
  "- **Everyone gets a win:** no day leaves anyone - big or small - with nothing.",
  "",
  "## How planning works here",
  "- A **trip** is a holiday you own in the Yaycay app (destination + dates). New",
  "  trips are created there, not through me - just say the word and I'll point",
  "  you to your dashboard.",
  "- I turn a trip into a day-by-day plan of **moments** (morning / midday /",
  "  afternoon / evening), each a kid, shared, or adult activity.",
  "- Planning is a loop, not a one-shot: I plan a day, surface what's nearby, fold",
  "  in your bookings, and keep refining as the family reacts.",
  "- **I save as I go.** Plans, the family brief (pace, must-dos, allergies), and",
  "  bookings all live on the trip - never something you copy in by hand.",
  "",
  "## Try asking",
  '- "Plan us a relaxed day with something for everyone."',
  '- "What\'s nearby that the kids would love?"',
  '- "It might rain Thursday - what\'s our backup?"',
  '- "Track our hotel and the Sea World tickets."',
  "",
  "Tell me which trip we're on (or ask me to list them) and we'll dive in.",
].join("\n");

/**
 * MCP resources: the live itinerary as ambient context. A connected assistant
 * can read `yaycay://trip/{trip_id}/itinerary` without spending a tool call, so
 * the plan is always in view as the conversation evolves.
 */
export function registerYaycayResources(server: McpServer): void {
  // A fixed, always-available "front door": the Yaycay worldview + how to plan
  // here, as ambient context the assistant can read without a tool call. This is
  // the brand experience showing up the moment a client browses Yaycay.
  server.registerResource(
    "yaycay_welcome",
    "yaycay://welcome",
    {
      description: "Welcome to Yaycay - the house style and how to plan a family trip here.",
      mimeType: "text/markdown",
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "text/markdown", text: WELCOME }],
    }),
  );

  server.registerResource(
    "trip_itinerary",
    new ResourceTemplate("yaycay://trip/{trip_id}/itinerary", {
      list: async (extra) => {
        const auth = authFrom(extra);
        try {
          const data = await contractJson<{ trips?: { id: string; destination?: string }[] }>(
            "/trips",
            auth,
          );
          return {
            resources: (data.trips ?? []).map((t) => ({
              uri: `yaycay://trip/${t.id}/itinerary`,
              name: `Itinerary: ${t.destination ?? t.id}`,
              mimeType: "application/json",
            })),
          };
        } catch {
          return { resources: [] };
        }
      },
    }),
    {
      description: "The live day-by-day itinerary for a Yaycay trip (ambient planning context).",
      mimeType: "application/json",
    },
    async (uri, variables, extra) => {
      const auth = authFrom(extra);
      const tripId = String(variables.trip_id);
      const content = await contractJson(`/trips/${encodeURIComponent(tripId)}/content`, auth);
      return {
        contents: [
          { uri: uri.href, mimeType: "application/json", text: JSON.stringify(content, null, 2) },
        ],
      };
    },
  );
}
