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

  it("without an API base, even served endpoints use the local mock", () => {
    expect(endpointUrl("/account", SERVED.account)).toBe("/api/account");
    expect(endpointUrl("/checkout/session", SERVED.checkout)).toBe("/api/checkout/session");
    expect(endpointUrl("/trips/t1/packing", SERVED.packing)).toBe("/api/trips/t1/packing");
  });

  it("marks the served set per CONTRACT-STATUS (v0.12)", () => {
    expect(SERVED.demoGenerateDay).toBe(true);
    expect(SERVED.signupCapture).toBe(true);
    expect(SERVED.listTrips).toBe(true);
    expect(SERVED.getTrip).toBe(true);
    expect(SERVED.profiles).toBe(true);
    expect(SERVED.journal).toBe(true);
    expect(SERVED.checkout).toBe(true);
    expect(SERVED.progress).toBe(true);
    expect(SERVED.stars).toBe(true);
    expect(SERVED.packing).toBe(true);
    expect(SERVED.grownups).toBe(true);
    expect(SERVED.media).toBe(true);
    // account is the only customer endpoint still deferred on BE.
    expect(SERVED.account).toBe(false);
  });
});
