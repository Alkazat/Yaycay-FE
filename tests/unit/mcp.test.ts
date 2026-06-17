import { describe, it, expect, beforeEach, vi } from "vitest";
import { s256, verifyPkce, randomToken } from "@/lib/mcp/pkce";
import { oauthStore, type Grant } from "@/lib/mcp/store";
import { validateAuthRequest } from "@/lib/mcp/oauthFlow";
import { registerYaycayTools, registerYaycayPrompts, type ToolAuth } from "@/lib/mcp/tools";
import { fetchNearbyPlaces, placesConfigured } from "@/lib/mcp/places";
import { SCOPES } from "@/lib/mcp/config";

function grant(over: Partial<Grant> = {}): Grant {
  const now = Date.now();
  return {
    connection_id: `conn_${randomToken(6)}`,
    access_token: `at_${randomToken(6)}`,
    refresh_token: `rt_${randomToken(6)}`,
    client_id: "cl",
    client_name: "Test Assistant",
    scope: SCOPES.read,
    user_id: "u",
    supabase_access_token: "",
    supabase_refresh_token: "",
    status: "active",
    created_at: now,
    last_used_at: null,
    expires_at: now + 60_000,
    ...over,
  };
}

describe("PKCE", () => {
  it("verifies a matching S256 challenge", () => {
    const verifier = randomToken(32);
    expect(verifyPkce(verifier, s256(verifier))).toBe(true);
  });
  it("rejects a wrong verifier and empty input", () => {
    const verifier = randomToken(32);
    expect(verifyPkce("not-the-verifier", s256(verifier))).toBe(false);
    expect(verifyPkce("", s256(verifier))).toBe(false);
    expect(verifyPkce(verifier, "")).toBe(false);
  });
});

describe("in-memory OAuth store", () => {
  it("issues single-use codes and honours expiry", async () => {
    const base = {
      client_id: "cl",
      redirect_uri: "https://x/cb",
      code_challenge: "ch",
      scope: SCOPES.read,
      user_id: "u",
      supabase_access_token: "",
      supabase_refresh_token: "",
    };
    await oauthStore.saveCode({ ...base, code: "c1", expires_at: Date.now() + 60_000 });
    expect(await oauthStore.takeCode("c1")).not.toBeNull();
    expect(await oauthStore.takeCode("c1")).toBeNull(); // single use

    await oauthStore.saveCode({ ...base, code: "c2", expires_at: Date.now() - 1 });
    expect(await oauthStore.takeCode("c2")).toBeNull(); // expired
  });

  it("resolves active grants and rejects revoked + expired", async () => {
    const active = grant({ user_id: "u-active" });
    await oauthStore.saveGrant(active);
    expect((await oauthStore.getGrantByAccessToken(active.access_token))?.user_id).toBe("u-active");

    // Revocation is immediate: the access token stops resolving.
    expect(await oauthStore.revokeConnection(active.connection_id, "u-active")).toBe(true);
    expect(await oauthStore.getGrantByAccessToken(active.access_token)).toBeNull();

    const expired = grant({ expires_at: Date.now() - 1 });
    await oauthStore.saveGrant(expired);
    expect(await oauthStore.getGrantByAccessToken(expired.access_token)).toBeNull();
  });

  it("only lets the owner revoke their connection", async () => {
    const g = grant({ user_id: "owner" });
    await oauthStore.saveGrant(g);
    expect(await oauthStore.revokeConnection(g.connection_id, "someone-else")).toBe(false);
    expect((await oauthStore.getGrantByAccessToken(g.access_token))?.status).toBe("active");
  });

  it("rotates tokens while preserving connection identity", async () => {
    const g = grant({ user_id: "u-rot" });
    const oldAccess = g.access_token;
    await oauthStore.saveGrant(g);
    const rotated = await oauthStore.rotateTokens(g.connection_id, {
      access_token: "at_new",
      refresh_token: "rt_new",
      expires_at: Date.now() + 60_000,
    });
    expect(rotated?.connection_id).toBe(g.connection_id);
    expect(await oauthStore.getGrantByAccessToken(oldAccess)).toBeNull(); // old token retired
    expect((await oauthStore.getGrantByAccessToken("at_new"))?.connection_id).toBe(g.connection_id);
    // Still one connection for the user, not two.
    expect((await oauthStore.listConnectionsByUser("u-rot")).length).toBe(1);
  });

  it("lists a user's connections with a can-write view and stamps last used", async () => {
    const g = grant({ user_id: "u-list", scope: `${SCOPES.read} ${SCOPES.plan}` });
    await oauthStore.saveGrant(g);
    await oauthStore.touchLastUsed(g.access_token);
    const list = await oauthStore.listConnectionsByUser("u-list");
    expect(list).toHaveLength(1);
    expect(list[0].client_name).toBe("Test Assistant");
    expect(list[0].scopes).toContain(SCOPES.plan);
    expect(list[0].last_used_at).not.toBeNull();
  });

  it("updates the captured parent Supabase tokens (the connector's refresh path)", async () => {
    const g = grant({ user_id: "u-pt" });
    await oauthStore.saveGrant(g);
    await oauthStore.updateParentTokens(g.connection_id, "new-sat", "new-srt");
    const got = await oauthStore.getGrantByAccessToken(g.access_token);
    expect(got?.supabase_access_token).toBe("new-sat");
    expect(got?.supabase_refresh_token).toBe("new-srt");
  });
});

describe("validateAuthRequest", () => {
  beforeEach(async () => {
    await oauthStore.saveClient({
      client_id: "cl_test",
      redirect_uris: ["https://client.example/cb"],
      created_at: Date.now(),
    });
  });

  function params(over: Record<string, string> = {}): URLSearchParams {
    return new URLSearchParams({
      response_type: "code",
      client_id: "cl_test",
      redirect_uri: "https://client.example/cb",
      code_challenge: "abc",
      code_challenge_method: "S256",
      scope: `${SCOPES.read} ${SCOPES.plan}`,
      state: "xyz",
      ...over,
    });
  }

  it("accepts a valid request and keeps supported scopes", async () => {
    const r = await validateAuthRequest(params());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.req.scope).toBe(`${SCOPES.read} ${SCOPES.plan}`);
  });

  it("drops unsupported scopes", async () => {
    const r = await validateAuthRequest(params({ scope: `${SCOPES.read} bogus.scope` }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.req.scope).toBe(SCOPES.read);
  });

  it("rejects unknown client, bad redirect, non-S256, missing challenge", async () => {
    expect((await validateAuthRequest(params({ client_id: "nope" }))).ok).toBe(false);
    expect((await validateAuthRequest(params({ redirect_uri: "https://evil/cb" }))).ok).toBe(false);
    expect((await validateAuthRequest(params({ code_challenge_method: "plain" }))).ok).toBe(false);
    const noChallenge = params();
    noChallenge.delete("code_challenge");
    expect((await validateAuthRequest(noChallenge)).ok).toBe(false);
    expect((await validateAuthRequest(params({ response_type: "token" }))).ok).toBe(false);
  });
});

describe("authorization-code token exchange", () => {
  it("exchanges a PKCE-valid code, rejects a bad verifier, and refreshes once", async () => {
    const { POST } = await import("@/app/api/oauth/token/route");
    const verifier = randomToken(32);

    await oauthStore.saveClient({
      client_id: "cl_tok",
      client_name: "Codey",
      redirect_uris: ["https://c/cb"],
      created_at: Date.now(),
    });
    const saveCode = (code: string) =>
      oauthStore.saveCode({
        code,
        client_id: "cl_tok",
        redirect_uri: "https://c/cb",
        code_challenge: s256(verifier),
        scope: SCOPES.read,
        user_id: "u-tok",
        supabase_access_token: "sb-token",
        supabase_refresh_token: "sb-refresh",
        expires_at: Date.now() + 60_000,
      });

    await saveCode("good1");
    const bad = await POST(
      form({
        grant_type: "authorization_code",
        code: "good1",
        code_verifier: "wrong",
        client_id: "cl_tok",
        redirect_uri: "https://c/cb",
      }),
    );
    expect(bad.status).toBe(400);

    await saveCode("good2");
    const res = await POST(
      form({
        grant_type: "authorization_code",
        code: "good2",
        code_verifier: verifier,
        client_id: "cl_tok",
        redirect_uri: "https://c/cb",
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      access_token: string;
      refresh_token: string;
      scope: string;
    };
    expect(body.scope).toBe(SCOPES.read);

    const issued = await oauthStore.getGrantByAccessToken(body.access_token);
    expect(issued?.supabase_access_token).toBe("sb-token");
    expect(issued?.client_name).toBe("Codey");

    // Refresh rotates the tokens but keeps one connection.
    const refreshed = await POST(
      form({ grant_type: "refresh_token", refresh_token: body.refresh_token }),
    );
    expect(refreshed.status).toBe(200);
    const rbody = (await refreshed.json()) as { access_token: string };
    expect(rbody.access_token).not.toBe(body.access_token);
    expect(await oauthStore.getGrantByRefreshToken(body.refresh_token)).toBeNull(); // old refresh retired
    expect((await oauthStore.listConnectionsByUser("u-tok")).length).toBe(1);
  });
});

describe("MCP tools", () => {
  function fakeServer() {
    const tools: Record<
      string,
      (args: unknown, extra: unknown) => Promise<{ content: { text: string }[]; isError?: boolean }>
    > = {};
    return {
      server: {
        tool: (name: string, _d: string, _s: unknown, h: (typeof tools)[string]) =>
          (tools[name] = h),
      },
      tools,
    };
  }
  function extraFor(auth: Partial<ToolAuth>) {
    return {
      authInfo: {
        scopes: auth.scopes ?? [],
        extra: { origin: "http://localhost:3000", accessToken: "", connectionId: "conn_x" },
      },
    };
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("blocks a read tool without the read scope (branded, not thrown) and allows it with the scope", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);

    // Missing scope returns warm guidance, never a raw throw.
    const denied = await tools.list_trips({}, extraFor({ scopes: [] }));
    expect(denied.isError).toBe(true);
    expect(denied.content[0].text).toMatch(/reconnect/i);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ trips: [{ id: "t_1" }] }), { status: 200 }),
    );
    const out = await tools.list_trips({}, extraFor({ scopes: [SCOPES.read] }));
    expect(out.content[0].text).toContain("t_1");
  });

  it("requires the plan scope for plan_trip and marks the call as connector-sourced", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);

    const denied = await tools.plan_trip(
      { trip_id: "t_1", message: "hi" },
      extraFor({ scopes: [SCOPES.read] }),
    );
    expect(denied.isError).toBe(true);
    expect(denied.content[0].text).toMatch(/plan/i);

    // plan_trip first confirms the trip exists (GET), then streams the planner.
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (url) =>
        String(url).includes("/plan/chat")
          ? sseResponse("howdy")
          : new Response(JSON.stringify({ id: "t_1" }), { status: 200 }),
      );
    const out = await tools.plan_trip(
      { trip_id: "t_1", message: "plan my trip" },
      extraFor({ scopes: [SCOPES.read, SCOPES.plan] }),
    );
    expect(out.content[0].text).toContain("howdy");

    const planCall = fetchSpy.mock.calls.find((c) => String(c[0]).includes("/plan/chat"));
    const headers = new Headers((planCall?.[1] as RequestInit).headers);
    expect(headers.get("x-yaycay-source")).toBe("connector");
    expect(headers.get("x-yaycay-connection-id")).toBe("conn_x");
  });

  it("guides the family to the app for a brand-new trip instead of erroring", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    const out = await tools.request_new_trip(
      { destination: "Gold Coast" },
      extraFor({ scopes: [SCOPES.read] }),
    );
    expect(out.isError).toBeFalsy();
    expect(out.content[0].text).toContain("Gold Coast");
    expect(out.content[0].text).toContain("/trips"); // dashboard link
    expect(out.content[0].text).toContain("can_create_here");
  });

  it("requires the plan scope to create an explorer and derives a child's band from age", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);

    const denied = await tools.create_explorer(
      { name: "Maya" },
      extraFor({ scopes: [SCOPES.read] }),
    );
    expect(denied.isError).toBe(true);
    expect(denied.content[0].text).toMatch(/plan/i);

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ id: "p_1", name: "Maya" }), { status: 201 }));
    const out = await tools.create_explorer(
      { name: "Maya", age: 4 },
      extraFor({ scopes: [SCOPES.read, SCOPES.plan] }),
    );
    expect(out.isError).toBeFalsy();
    expect(out.content[0].text).toContain("Maya");

    const call = fetchSpy.mock.calls.find((c) => String(c[0]).includes("/profiles"));
    expect((call?.[1] as RequestInit).method).toBe("POST");
    const body = JSON.parse(String((call?.[1] as RequestInit).body));
    expect(body).toMatchObject({ name: "Maya", type: "child", mode: "little", age: 4 });
  });

  it("creates a grown-up as a parent/carer in the standard voice", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ id: "p_2", name: "Nan" }), { status: 201 }));
    const out = await tools.create_explorer(
      { name: "Nan", kind: "grown_up" },
      extraFor({ scopes: [SCOPES.plan] }),
    );
    expect(out.isError).toBeFalsy();
    const call = fetchSpy.mock.calls.find((c) => String(c[0]).includes("/profiles"));
    const body = JSON.parse(String((call?.[1] as RequestInit).body));
    expect(body).toMatchObject({ name: "Nan", type: "parent_carer" });
    // No band for a grown-up: the DB enum is children-only; "standard" is derived.
    expect(body.mode).toBeUndefined();
    expect(body.age).toBeUndefined();
  });

  it("lists explorers and grown-ups as people without leaking dietary through the connector", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          profiles: [
            { id: "p_1", name: "Maya", type: "child", mode: "little", age: 4, dietary: ["nut-free"] },
            { id: "p_2", name: "Nan", type: "parent_carer", mode: "standard" },
          ],
        }),
        { status: 200 },
      ),
    );
    const out = await tools.list_explorers({}, extraFor({ scopes: [SCOPES.read] }));
    const text = out.content[0].text;
    expect(text).toContain("Maya");
    expect(text).toContain('"kind": "child"');
    expect(text).toContain('"kind": "grown_up"');
    expect(text).not.toContain("nut-free");
  });

  it("turns a missing trip into friendly branded guidance (no raw 500)", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 404 }));
    const out = await tools.get_trip_content(
      { trip_id: "missing" },
      extraFor({ scopes: [SCOPES.read] }),
    );
    expect(out.isError).toBe(true);
    expect(out.content[0].text).toMatch(/Yaycay app|dashboard/i);
    expect(out.content[0].text).not.toContain("500");
  });

  it("builds a brief from trip + travellers without leaking dietary/medical", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
      String(url).includes("/profiles")
        ? new Response(
            JSON.stringify({
              profiles: [
                {
                  name: "Lenny",
                  age: 6,
                  interests: ["dinosaurs"],
                  dietary: ["nut-free"],
                  medical: ["epipen"],
                },
              ],
            }),
            { status: 200 },
          )
        : new Response(JSON.stringify({ id: "t_1", destination: "Singapore" }), { status: 200 }),
    );
    const out = await tools.get_trip_brief({ trip_id: "t_1" }, extraFor({ scopes: [SCOPES.read] }));
    const text = out.content[0].text;
    expect(text).toContain("Lenny");
    expect(text).toContain("dinosaurs");
    expect(text).not.toContain("nut-free"); // dietary never exported off-platform
    expect(text).not.toContain("epipen"); // medical never exported off-platform
  });

  it("surfaces curated nearby ideas with a proactive nudge", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    // whats_nearby reads the companion picks AND the trip (for the destination),
    // so hand back a fresh Response per call (a body can only be read once).
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) =>
      String(url).includes("/companion")
        ? new Response(JSON.stringify({ cards: [{ near_label: "Gardens by the Bay" }] }), {
            status: 200,
          })
        : new Response(JSON.stringify({ id: "t_1", destination: "Singapore" }), { status: 200 }),
    );
    const out = await tools.whats_nearby({ trip_id: "t_1" }, extraFor({ scopes: [SCOPES.read] }));
    expect(out.content[0].text).toContain("Gardens by the Bay");
    expect(out.content[0].text).toContain("rainy-day");
  });

  it("tracks a reservation (pre-checks the trip) and confirms it", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url, init) => {
      const u = String(url);
      const method = (init as RequestInit | undefined)?.method ?? "GET";
      if (u.endsWith("/reservations") && method === "POST") {
        return new Response(JSON.stringify({ reservation: { id: "r_1", status: "planned" } }), {
          status: 200,
        });
      }
      if (u.includes("/reservations/")) {
        return new Response(JSON.stringify({ reservation: { id: "r_1", status: "confirmed" } }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify({ id: "t_1" }), { status: 200 }); // trip pre-check
    });

    const added = await tools.add_reservation(
      { trip_id: "t_1", title: "Sea World tickets", kind: "activity" },
      extraFor({ scopes: [SCOPES.read, SCOPES.plan] }),
    );
    expect(added.content[0].text).toContain("r_1");
    // Branded, and explicit that nothing was paid/booked on the family's behalf.
    expect(added.content[0].text).toMatch(/Tracked it/i);
    expect(added.content[0].text).toMatch(/no payment/i);
    const post = fetchSpy.mock.calls.find(
      (c) => String(c[0]).endsWith("/reservations") && (c[1] as RequestInit)?.method === "POST",
    );
    expect(String((post?.[1] as RequestInit)?.body)).toContain("Sea World tickets");

    const confirmed = await tools.confirm_reservation(
      { trip_id: "t_1", reservation_id: "r_1", ref: "ABC123" },
      extraFor({ scopes: [SCOPES.read, SCOPES.plan] }),
    );
    expect(confirmed.content[0].text).toContain("confirmed");
    expect(confirmed.content[0].text).toMatch(/Locked in/i);
  });

  it("blocks add_reservation without the plan scope (no payment, just tracking)", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    const denied = await tools.add_reservation(
      { trip_id: "t_1", title: "x" },
      extraFor({ scopes: [SCOPES.read] }),
    );
    expect(denied.isError).toBe(true);
    expect(denied.content[0].text).toMatch(/plan/i);
  });

  it("persists structural edits via edit_itinerary (connector write)", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ days: [{ id: "d1" }] }), { status: 200 }));
    const out = await tools.edit_itinerary(
      {
        trip_id: "t_1",
        ops: [{ op: "update_activity", activity_id: "a1", set: { body: "Pip's nut allergy" } }],
      },
      extraFor({ scopes: [SCOPES.read, SCOPES.plan] }),
    );
    expect(out.content[0].text).toContain("saved");
    expect(out.content[0].text).toMatch(/Saved to your Yaycay trip/i);
    const call = fetchSpy.mock.calls.find((c) => String(c[0]).includes("/content/patch"));
    expect((call?.[1] as RequestInit)?.method).toBe("POST");
    expect(new Headers((call?.[1] as RequestInit)?.headers).get("x-yaycay-source")).toBe(
      "connector",
    );
  });

  it("blocks edit_itinerary without the plan scope", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    const denied = await tools.edit_itinerary(
      { trip_id: "t_1", ops: [] },
      extraFor({ scopes: [SCOPES.read] }),
    );
    expect(denied.isError).toBe(true);
    expect(denied.content[0].text).toMatch(/plan/i);
  });

  it("saves the family's brief (allergies etc.) via set_trip_brief", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ intent: { constraints: { allergies: ["nuts"] } } }), {
        status: 200,
      }),
    );
    const out = await tools.set_trip_brief(
      { trip_id: "t_1", constraints: { allergies: ["nuts"] }, must_do: ["Sea World"] },
      extraFor({ scopes: [SCOPES.read, SCOPES.plan] }),
    );
    expect(out.content[0].text).toContain("nuts");
    expect(out.content[0].text).toMatch(/remember/i);
    const call = fetchSpy.mock.calls.find((c) => String(c[0]).includes("/intent"));
    expect((call?.[1] as RequestInit)?.method).toBe("PUT");
    expect(String((call?.[1] as RequestInit)?.body)).toContain("Sea World");
  });

  it("exposes a lean, curated tool set (folded reads removed)", () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    const names = Object.keys(tools).sort();
    expect(names).toEqual(
      [
        "add_reservation",
        "confirm_reservation",
        "create_explorer",
        "edit_itinerary",
        "get_trip_brief",
        "get_trip_content",
        "list_explorers",
        "list_trips",
        "plan_trip",
        "request_new_trip",
        "set_trip_brief",
        "whats_nearby",
      ].sort(),
    );
    // The reads folded into get_trip_brief are gone, keeping the client focused.
    expect(tools.get_trip).toBeUndefined();
    expect(tools.get_packing_list).toBeUndefined();
    expect(tools.list_reservations).toBeUndefined();
  });

  it("folds bookings, packing and a plan outline into a single get_trip_brief call", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes("/profiles"))
        return new Response(JSON.stringify({ profiles: [] }), { status: 200 });
      if (u.includes("/reservations"))
        return new Response(JSON.stringify({ reservations: [{ id: "r_1" }] }), { status: 200 });
      if (u.includes("/packing"))
        return new Response(JSON.stringify({ lists: ["sunscreen"] }), { status: 200 });
      if (u.endsWith("/content"))
        return new Response(JSON.stringify({ days: [{ label: "Day 1", moments: [1, 2] }] }), {
          status: 200,
        });
      if (u.includes("/intent"))
        return new Response(JSON.stringify({ intent: {} }), { status: 200 });
      return new Response(JSON.stringify({ id: "t_1", destination: "Singapore" }), { status: 200 });
    });
    const out = await tools.get_trip_brief({ trip_id: "t_1" }, extraFor({ scopes: [SCOPES.read] }));
    const text = out.content[0].text;
    expect(text).toContain("r_1"); // reservations folded in
    expect(text).toContain("sunscreen"); // packing folded in
    expect(text).toContain("Day 1"); // plan outline
    expect(text).toContain('"moments": 2'); // outline counts how full each day is
  });
});

describe("MCP prompts", () => {
  function fakePromptServer() {
    const prompts: Record<
      string,
      (args: Record<string, string | undefined>) => { messages: { content: { text: string } }[] }
    > = {};
    return {
      server: {
        prompt: (name: string, _d: string, _s: unknown, cb: (typeof prompts)[string]) =>
          (prompts[name] = cb),
      },
      prompts,
    };
  }

  it("registers branded prompts that carry the house style", () => {
    const { server, prompts } = fakePromptServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayPrompts(server as any);
    expect(Object.keys(prompts)).toEqual(
      expect.arrayContaining(["plan_a_day", "something_for_everyone", "whats_nearby", "rainy_day"]),
    );
    const day = prompts.plan_a_day({ trip_id: "t_1", focus: "beach" });
    const text = day.messages[0].content.text;
    expect(text).toContain("t_1");
    expect(text).toContain("beach");
    expect(text).toMatch(/yay/i);
  });
});

describe("live places provider", () => {
  const KEY = "PLACES_API_KEY";
  const PROVIDER = "PLACES_PROVIDER";
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env[KEY];
    delete process.env[PROVIDER];
  });

  it("is unavailable (and makes no network call) when no key is configured", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    expect(placesConfigured()).toBe(false);
    const out = await fetchNearbyPlaces("Singapore");
    expect(out.available).toBe(false);
    expect(out.places).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("maps Google Places results into branded, family-lens picks", async () => {
    process.env[KEY] = "test-key";
    process.env[PROVIDER] = "google";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          places: [
            {
              displayName: { text: "Gardens by the Bay" },
              formattedAddress: "18 Marina Gardens Dr",
              rating: 4.7,
              primaryTypeDisplayName: { text: "Park" },
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const out = await fetchNearbyPlaces("Singapore");
    expect(out.available).toBe(true);
    expect(out.source).toBe("google");
    expect(out.places[0].name).toBe("Gardens by the Bay");
    expect(out.places[0].for_the_family).toMatch(/outdoor/i); // a Park gets the outdoor lens
  });

  it("degrades to unavailable (never throws) when the provider errors", async () => {
    process.env[KEY] = "test-key";
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    const out = await fetchNearbyPlaces("Singapore");
    expect(out.available).toBe(false);
    expect(out.places).toEqual([]);
  });
});

/** Build a form-encoded Request for the token endpoint. */
function form(fields: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  });
}

/** A minimal text/event-stream planner response with one delta then [DONE]. */
function sseResponse(text: string): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      controller.enqueue(enc.encode(`data: ${JSON.stringify({ delta: text })}\n\n`));
      controller.enqueue(enc.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}
