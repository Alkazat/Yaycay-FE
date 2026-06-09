import { describe, it, expect } from "vitest";
import { endpointUrl, SERVED } from "@/lib/api/http";

// No NEXT_PUBLIC_API_BASE is set in the test env, so everything routes to the
// in-repo mock regardless of the served flag.
describe("endpointUrl (no API base configured)", () => {
  it("served endpoints fall back to the local mock", () => {
    expect(endpointUrl("/trips", SERVED.listTrips)).toBe("/api/trips");
    expect(endpointUrl("/demo/generate-day", SERVED.demoGenerateDay)).toBe(
      "/api/demo/generate-day",
    );
  });

  it("deferred endpoints always use the local mock", () => {
    expect(endpointUrl("/account", SERVED.account)).toBe("/api/account");
    expect(endpointUrl("/checkout/session", SERVED.checkout)).toBe("/api/checkout/session");
  });

  it("marks the served set per CONTRACT-STATUS v0.4", () => {
    expect(SERVED.demoGenerateDay).toBe(true);
    expect(SERVED.signupCapture).toBe(true);
    expect(SERVED.listTrips).toBe(true);
    expect(SERVED.getTrip).toBe(true);
    expect(SERVED.profiles).toBe(false);
    expect(SERVED.account).toBe(false);
    expect(SERVED.journal).toBe(false);
    expect(SERVED.checkout).toBe(false);
  });
});
