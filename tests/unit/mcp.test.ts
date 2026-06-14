import { describe, it, expect, beforeEach, vi } from "vitest";
import { s256, verifyPkce, randomToken } from "@/lib/mcp/pkce";
import { oauthStore, type RegisteredClient } from "@/lib/mcp/store";
import { validateAuthRequest } from "@/lib/mcp/oauthFlow";
import { registerYaycayTools, type ToolAuth } from "@/lib/mcp/tools";
import { SCOPES } from "@/lib/mcp/config";

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
    await oauthStore.saveCode({
      code: "c1",
      client_id: "cl",
      redirect_uri: "https://x/cb",
      code_challenge: "ch",
      scope: SCOPES.read,
      user_id: "u",
      supabase_access_token: "",
      supabase_refresh_token: "",
      expires_at: Date.now() + 60_000,
    });
    expect(await oauthStore.takeCode("c1")).not.toBeNull();
    expect(await oauthStore.takeCode("c1")).toBeNull(); // single use

    await oauthStore.saveCode({
      code: "c2",
      client_id: "cl",
      redirect_uri: "https://x/cb",
      code_challenge: "ch",
      scope: SCOPES.read,
      user_id: "u",
      supabase_access_token: "",
      supabase_refresh_token: "",
      expires_at: Date.now() - 1, // already expired
    });
    expect(await oauthStore.takeCode("c2")).toBeNull();
  });

  it("looks up grants by access + refresh token and deletes both", async () => {
    const grant = {
      access_token: "at",
      refresh_token: "rt",
      client_id: "cl",
      scope: SCOPES.read,
      user_id: "u",
      supabase_access_token: "",
      supabase_refresh_token: "",
      expires_at: Date.now() + 60_000,
    };
    await oauthStore.saveGrant(grant);
    expect((await oauthStore.getGrantByAccessToken("at"))?.client_id).toBe("cl");
    expect((await oauthStore.getGrantByRefreshToken("rt"))?.client_id).toBe("cl");
    await oauthStore.deleteGrant("rt");
    expect(await oauthStore.getGrantByAccessToken("at")).toBeNull();
  });
});

describe("validateAuthRequest", () => {
  const client: RegisteredClient = {
    client_id: "cl_test",
    redirect_uris: ["https://client.example/cb"],
    created_at: Date.now(),
  };
  beforeEach(async () => {
    await oauthStore.saveClient(client);
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
  it("exchanges a PKCE-valid code, rejects a bad verifier, and refreshes", async () => {
    const { POST } = await import("@/app/api/oauth/token/route");
    const verifier = randomToken(32);

    await oauthStore.saveClient({
      client_id: "cl_tok",
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
        user_id: "u1",
        supabase_access_token: "sb-token",
        supabase_refresh_token: "sb-refresh",
        expires_at: Date.now() + 60_000,
      });

    // Wrong verifier is rejected.
    await saveCode("good1");
    const bad = await POST(form({ grant_type: "authorization_code", code: "good1", code_verifier: "wrong", client_id: "cl_tok", redirect_uri: "https://c/cb" }));
    expect(bad.status).toBe(400);

    // Correct verifier yields a usable access token.
    await saveCode("good2");
    const res = await POST(form({ grant_type: "authorization_code", code: "good2", code_verifier: verifier, client_id: "cl_tok", redirect_uri: "https://c/cb" }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { access_token: string; refresh_token: string; scope: string };
    expect(body.scope).toBe(SCOPES.read);

    const grant = await oauthStore.getGrantByAccessToken(body.access_token);
    expect(grant?.supabase_access_token).toBe("sb-token");

    // Refresh rotates the tokens.
    const refreshed = await POST(form({ grant_type: "refresh_token", refresh_token: body.refresh_token }));
    expect(refreshed.status).toBe(200);
    const rbody = (await refreshed.json()) as { access_token: string };
    expect(rbody.access_token).not.toBe(body.access_token);
    expect(await oauthStore.getGrantByRefreshToken(body.refresh_token)).toBeNull(); // old refresh revoked
  });
});

describe("MCP tool scope gating", () => {
  function fakeServer() {
    const tools: Record<string, (args: unknown, extra: unknown) => Promise<{ content: { text: string }[] }>> = {};
    return {
      server: { tool: (name: string, _d: string, _s: unknown, h: typeof tools[string]) => (tools[name] = h) },
      tools,
    };
  }
  function extraFor(auth: Partial<ToolAuth>) {
    return { authInfo: { scopes: auth.scopes ?? [], extra: { origin: "http://localhost:3000", accessToken: "" } } };
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("blocks a read tool without the read scope and allows it with the scope", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);

    await expect(tools.list_trips({}, extraFor({ scopes: [] }))).rejects.toThrow(/scope/);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ trips: [{ id: "t_1" }] }), { status: 200 }),
    );
    const out = await tools.list_trips({}, extraFor({ scopes: [SCOPES.read] }));
    expect(out.content[0].text).toContain("t_1");
  });

  it("requires the plan scope for plan_trip", async () => {
    const { server, tools } = fakeServer();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerYaycayTools(server as any);
    await expect(
      tools.plan_trip({ trip_id: "t_1", message: "hi" }, extraFor({ scopes: [SCOPES.read] })),
    ).rejects.toThrow(/plan/);
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
