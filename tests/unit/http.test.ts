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
    expect(endpointUrl("/trips/t1/journal", SERVED.journal)).toBe("/api/trips/t1/journal");
  });

  it("marks the live served set the FE consumes today", () => {
    // Live since launch / earlier waves.
    expect(SERVED.demoGenerateDay).toBe(true);
    expect(SERVED.signupCapture).toBe(true);
    expect(SERVED.listTrips).toBe(true);
    expect(SERVED.getTrip).toBe(true);
    expect(SERVED.content).toBe(true);
    expect(SERVED.profiles).toBe(true);
    expect(SERVED.checkout).toBe(true);
    // Per-trip surfaces migrated to the contract shapes.
    expect(SERVED.packing).toBe(true);
    expect(SERVED.progress).toBe(true);
    expect(SERVED.stars).toBe(true);
    expect(SERVED.grownups).toBe(true);
    expect(SERVED.ingest).toBe(true);
    expect(SERVED.connectors).toBe(true);
    // Still on the mock: journal (contract has no day_id), account, media.
    expect(SERVED.journal).toBe(false);
    expect(SERVED.account).toBe(false);
    expect(SERVED.media).toBe(false);
  });
});
