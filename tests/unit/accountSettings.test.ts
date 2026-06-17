import { describe, it, expect } from "vitest";
import { MOCK_ACCOUNT, MOCK_TRANSACTIONS } from "@/lib/contract-mock/data";

describe("account profile + transactions mock", () => {
  it("account carries an editable display name", () => {
    expect(typeof MOCK_ACCOUNT.name === "string" || MOCK_ACCOUNT.name === null).toBe(true);
    expect(MOCK_ACCOUNT.name).toBeTruthy();
  });

  it("every transaction declares its trip linkage (id + name, possibly null)", () => {
    for (const t of MOCK_TRANSACTIONS) {
      expect(t).toHaveProperty("trip_id");
      expect(t).toHaveProperty("trip_name");
      // id and name are present together, or both absent.
      expect(Boolean(t.trip_id)).toBe(Boolean(t.trip_name));
    }
  });

  it("at least one transaction ties to a real trip for the Trip column", () => {
    expect(MOCK_TRANSACTIONS.some((t) => t.trip_id !== null)).toBe(true);
  });
});
