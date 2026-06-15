import { describe, it, expect } from "vitest";
import { safeNextPath } from "@/lib/auth/safeNext";

const ORIGIN = "https://app.yaycay.ai";

describe("safeNextPath", () => {
  it("keeps a relative same-origin path", () => {
    expect(safeNextPath("/trips", ORIGIN)).toBe("/trips");
    expect(safeNextPath("/api/oauth/authorize?response_type=code&x=1", ORIGIN)).toBe(
      "/api/oauth/authorize?response_type=code&x=1",
    );
  });

  it("reduces a same-origin absolute URL to path + query (the OAuth hand-back)", () => {
    expect(
      safeNextPath(`${ORIGIN}/api/oauth/authorize?response_type=code&client_id=abc`, ORIGIN),
    ).toBe("/api/oauth/authorize?response_type=code&client_id=abc");
  });

  it("rejects cross-origin absolute URLs", () => {
    expect(safeNextPath("https://evil.example/api/oauth/authorize", ORIGIN)).toBe("/trips");
  });

  it("rejects protocol-relative and scheme tricks", () => {
    expect(safeNextPath("//evil.example/x", ORIGIN)).toBe("/trips");
    expect(safeNextPath("javascript:alert(1)", ORIGIN)).toBe("/trips");
  });

  it("falls back for empty / missing input", () => {
    expect(safeNextPath(null, ORIGIN)).toBe("/trips");
    expect(safeNextPath(undefined, ORIGIN)).toBe("/trips");
    expect(safeNextPath("", ORIGIN)).toBe("/trips");
  });

  it("keeps relative paths even without a known origin (SSR)", () => {
    expect(safeNextPath("/trips", "")).toBe("/trips");
    // No origin to validate an absolute URL against -> safe fallback.
    expect(safeNextPath(`${ORIGIN}/api/oauth/authorize`, "")).toBe("/trips");
  });
});
