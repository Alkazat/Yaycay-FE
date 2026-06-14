import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { updateAccount } from "@/lib/api/account";
import { uploadPhoto } from "@/lib/api/media";

// No NEXT_PUBLIC_API_BASE in the test env, so calls route to the in-repo mock
// (relative /api paths) and live-only behaviour (the Storage PUT) is skipped.

describe("updateAccount", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ email: "a@b.com", secondary_email: "r@b.com", tier: "ours" }), {
          status: 200,
        }),
      ),
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("PATCHes /account with the recovery email and returns the summary", async () => {
    const out = await updateAccount({ secondary_email: "r@b.com" });
    expect(out.secondary_email).toBe("r@b.com");
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/account");
    expect((init as RequestInit).method).toBe("PATCH");
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({ secondary_email: "r@b.com" });
  });

  it("clears the recovery email with null", async () => {
    await updateAccount({ secondary_email: null });
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({ secondary_email: null });
  });
});

describe("uploadPhoto", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ media_ref: "media_x", path: "p", upload_url: "/put", token: "t" }),
          { status: 200 },
        ),
      ),
    );
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns the media_ref and skips the Storage PUT in mock mode", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "p.jpg", { type: "image/jpeg" });
    const ref = await uploadPhoto("t_1", file);
    expect(ref).toBe("media_x");
    // Only the sign-upload call; no PUT, because the call is not live.
    expect(fetchSpy.mock.calls).toHaveLength(1);
  });
});
