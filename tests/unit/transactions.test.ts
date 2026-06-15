import { describe, it, expect, afterEach, vi } from "vitest";
import { listTransactions } from "@/lib/api/transactions";
import { MOCK_TRANSACTIONS } from "@/lib/contract-mock/data";

describe("transactions", () => {
  afterEach(() => vi.restoreAllMocks());

  it("mock data uses USD amounts and known statuses", () => {
    expect(MOCK_TRANSACTIONS.length).toBeGreaterThan(0);
    for (const t of MOCK_TRANSACTIONS) {
      expect(typeof t.amount_usd).toBe("number");
      expect(["paid", "refunded", "pending"]).toContain(t.status);
    }
  });

  it("listTransactions unwraps { transactions }", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ transactions: [{ id: "t1", date: "x", description: "d", amount_usd: 9, status: "paid" }] }), {
        status: 200,
      }),
    );
    const out = await listTransactions();
    expect(out[0].id).toBe("t1");
  });
});
