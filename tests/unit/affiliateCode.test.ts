import { describe, it, expect, beforeEach } from "vitest";
import { captureAffiliateCode, getAffiliateCode } from "@/lib/affiliate/code";

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
