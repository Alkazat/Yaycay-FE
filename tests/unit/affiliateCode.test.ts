import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { captureAffiliateCode, getAffiliateCode } from "@/lib/affiliate/code";
import { createCheckoutSession } from "@/lib/api/account";

describe("affiliate code capture", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("captures and persists a valid ?code=", () => {
    window.history.replaceState({}, "", "/?code=SUMMER25");
    captureAffiliateCode();
    expect(getAffiliateCode()).toBe("SUMMER25");
  });

  it("returns undefined when no code was ever captured", () => {
    captureAffiliateCode();
    expect(getAffiliateCode()).toBeUndefined();
  });

  it("ignores a malformed code", () => {
    window.history.replaceState({}, "", `/?code=${encodeURIComponent("bad code!!")}`);
    captureAffiliateCode();
    expect(getAffiliateCode()).toBeUndefined();
  });

  it("keeps a previously captured code when a later page has none", () => {
    window.history.replaceState({}, "", "/?code=KEEP10");
    captureAffiliateCode();
    window.history.replaceState({}, "", "/account");
    captureAffiliateCode();
    expect(getAffiliateCode()).toBe("KEEP10");
  });
});

describe("createCheckoutSession forwards the affiliate code", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchSpy: any;
  beforeEach(() => {
    window.localStorage.clear();
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ url: "/checkout/mock" }), { status: 200 })),
    );
  });
  afterEach(() => vi.restoreAllMocks());

  function sentBody(): Record<string, unknown> {
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    return JSON.parse(String(init.body));
  }

  it("defaults code to the captured affiliate code", async () => {
    window.history.replaceState({}, "", "/?code=AUTUMN30");
    captureAffiliateCode();
    await createCheckoutSession({ price_id: "p1", trip_id: "t1" });
    expect(sentBody().code).toBe("AUTUMN30");
  });

  it("lets an explicit code win and omits it when none is captured", async () => {
    await createCheckoutSession({ price_id: "p1", code: "EXPLICIT" });
    expect(sentBody().code).toBe("EXPLICIT");

    fetchSpy.mockClear();
    await createCheckoutSession({ price_id: "p1" });
    expect(sentBody().code).toBeUndefined();
  });
});
