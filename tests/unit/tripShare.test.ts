import { describe, it, expect } from "vitest";
import {
  MOCK_TRIPS,
  archiveMockTrip,
  duplicateMockTrip,
  shareMockTrip,
  getMockSharedTrip,
} from "@/lib/contract-mock/data";

describe("trip management mocks", () => {
  it("archives and restores a trip", () => {
    const restored = archiveMockTrip("t_sg", false);
    expect(restored?.status).toBe("ready");
    const archived = archiveMockTrip("t_sg", true);
    expect(archived?.status).toBe("archived");
    // leave it restored for other tests
    archiveMockTrip("t_sg", false);
    expect(archiveMockTrip("nope", true)).toBeUndefined();
  });

  it("duplicates a trip into a fresh free draft with copied content", () => {
    const before = MOCK_TRIPS.length;
    const copy = duplicateMockTrip("t_sg");
    expect(copy).toBeDefined();
    expect(copy!.tier).toBe("free");
    expect(copy!.status).toBe("draft");
    expect(copy!.destination).toMatch(/copy/i);
    expect(MOCK_TRIPS.length).toBe(before + 1);
    // the duplicate's content is registered under its new id
    const shared = getMockSharedTrip(`shr_${copy!.id}_x`);
    expect(shared?.content.trip.id).toBe(copy!.id);
  });

  it("mints a share token that resolves to the trip content", () => {
    const token = shareMockTrip("t_sg");
    expect(token).toMatch(/^shr_t_sg_/);
    const shared = getMockSharedTrip(token!);
    expect(shared?.content.trip.destination).toMatch(/singapore/i);
    expect(shareMockTrip("missing")).toBeUndefined();
    expect(getMockSharedTrip("shr_missing_x")).toBeUndefined();
  });

  it("a recipient can duplicate a shared trip from its token", () => {
    // Mirrors POST /shared/:token/duplicate: resolve token -> trip -> copy.
    const token = shareMockTrip("t_sg")!;
    const shared = getMockSharedTrip(token)!;
    const copy = duplicateMockTrip(shared.content.trip.id);
    expect(copy?.tier).toBe("free");
    expect(copy?.id).not.toBe("t_sg");
  });
});
