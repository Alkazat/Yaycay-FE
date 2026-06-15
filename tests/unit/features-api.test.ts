import { describe, it, expect, beforeEach, vi } from "vitest";
import { getFeatures, putFeatures } from "@/lib/api/features";

// The api layer calls getAccessToken(); stub it so no Supabase client is needed.
vi.mock("@/lib/auth/session", () => ({ getAccessToken: async () => null }));

describe("features api", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("maps the BE rows into a profile-keyed override map", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          features: [
            { profile_id: "p1", overrides: { quizzes: true } },
            { profile_id: "p2", overrides: { games: false } },
          ],
        }),
        { status: 200 },
      ),
    );
    const out = await getFeatures("t_1");
    expect(out.p1).toEqual({ quizzes: true });
    expect(out.p2).toEqual({ games: false });
  });

  it("degrades a 404 to empty overrides (presets only)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 404 }));
    expect(await getFeatures("missing")).toEqual({});
  });

  it("PUTs a profile's overrides", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ profile_id: "p1" }), { status: 200 }));
    await putFeatures("t_1", "p1", { quizzes: false });
    const call = spy.mock.calls[0];
    expect((call[1] as RequestInit).method).toBe("PUT");
    const body = JSON.parse(String((call[1] as RequestInit).body));
    expect(body).toEqual({ profile_id: "p1", overrides: { quizzes: false } });
  });

  it("does not throw when a PUT lands before the endpoint is deployed (404)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 404 }));
    await expect(putFeatures("t_1", "p1", {})).resolves.toBeUndefined();
  });
});
