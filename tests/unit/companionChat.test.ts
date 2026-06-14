import { describe, it, expect, afterEach, vi } from "vitest";
import { getMockCompanion, getMockChatHistory } from "@/lib/contract-mock/data";
import { getCompanion } from "@/lib/api/companion";
import { getChatHistory } from "@/lib/api/chatHistory";

describe("Walker demo companion seed (t_sg)", () => {
  it("carries a tree-nut text flag and a one-tap rain plan", () => {
    const cards = getMockCompanion("t_sg");
    expect(cards.length).toBeGreaterThan(0);
    const card = cards[0];
    expect(card.rain_plan?.title).toMatch(/rain/i);
    const flags = card.options.flatMap((o) => o.flags);
    // Allergy state is a text label, never colour alone.
    expect(flags.some((f) => /tree-nut/i.test(f))).toBe(true);
    // Never claims "safe" / "100%".
    for (const o of card.options) {
      expect(`${o.note ?? ""} ${o.flags.join(" ")}`).not.toMatch(/\bsafe\b|100%/i);
    }
  });

  it("returns no cards for an unknown trip", () => {
    expect(getMockCompanion("nope")).toEqual([]);
  });
});

describe("Walker demo chat-history seed (t_sg)", () => {
  it("includes an import_chip turn (forwarded hotel confirmation)", () => {
    const msgs = getMockChatHistory("t_sg");
    expect(msgs.some((m) => m.kind === "import_chip")).toBe(true);
    expect(msgs.some((m) => /tree-nut/i.test(m.content))).toBe(true);
  });
});

describe("companion + chat API clients", () => {
  afterEach(() => vi.restoreAllMocks());

  it("getCompanion unwraps { cards }", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ cards: [{ id: "c1", options: [], created_at: "x" }] }), {
        status: 200,
      }),
    );
    const cards = await getCompanion("t_sg");
    expect(cards[0].id).toBe("c1");
  });

  it("getChatHistory unwraps { messages }", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ messages: [{ id: "m1", kind: "text", seq: 1 }] }), {
        status: 200,
      }),
    );
    const msgs = await getChatHistory("t_sg");
    expect(msgs[0].id).toBe("m1");
  });
});
