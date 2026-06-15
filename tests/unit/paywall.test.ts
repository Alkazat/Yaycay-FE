import { describe, it, expect, afterEach, vi } from "vitest";
import { PRODUCTS } from "@/lib/paywall";
import { createTrip } from "@/lib/api/trips";

describe("paywall catalogue", () => {
  it("maps to contract ProductId keys with USD prices", () => {
    expect(PRODUCTS.ours.id).toBe("price_holiday_ai");
    expect(PRODUCTS.ours.priceUsd).toBe(129);
    expect(PRODUCTS.byo.id).toBe("price_holiday_byo");
    expect(PRODUCTS.byo.priceUsd).toBe(59);
    expect(PRODUCTS.datakeep.id).toBe("price_datakeep_annual");
  });
});

describe("createTrip", () => {
  afterEach(() => vi.restoreAllMocks());

  it("POSTs the request and returns the created trip", async () => {
    const spy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ id: "t_x", destination: "Singapore", tier: "free", status: "draft", timezone: "UTC" }),
        { status: 201 },
      ),
    );
    const trip = await createTrip({ destination: "Singapore" });
    expect(trip.id).toBe("t_x");
    const init = spy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body)).destination).toBe("Singapore");
  });
});
