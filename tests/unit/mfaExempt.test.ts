import { describe, it, expect, afterEach } from "vitest";
import { isMfaExempt, mfaExemptUserIds } from "@/lib/auth/mfaExempt";

const WALKER = "43d7f92a-e17f-44cf-9fc7-60c23b889906";

describe("forced-2FA exemptions", () => {
  const original = process.env.MFA_EXEMPT_USER_IDS;
  afterEach(() => {
    if (original === undefined) delete process.env.MFA_EXEMPT_USER_IDS;
    else process.env.MFA_EXEMPT_USER_IDS = original;
  });

  it("exempts the built-in Walker demo account", () => {
    expect(isMfaExempt(WALKER)).toBe(true);
  });

  it("does not exempt a normal account or empty input", () => {
    expect(isMfaExempt("11111111-2222-3333-4444-555555555555")).toBe(false);
    expect(isMfaExempt(null)).toBe(false);
    expect(isMfaExempt(undefined)).toBe(false);
    expect(isMfaExempt("")).toBe(false);
  });

  it("adds ids from MFA_EXEMPT_USER_IDS (comma-separated, trimmed)", () => {
    process.env.MFA_EXEMPT_USER_IDS = " aaa , bbb ";
    const ids = mfaExemptUserIds();
    expect(ids.has("aaa")).toBe(true);
    expect(ids.has("bbb")).toBe(true);
    expect(ids.has(WALKER)).toBe(true); // built-in still present
    expect(isMfaExempt("aaa")).toBe(true);
  });
});
