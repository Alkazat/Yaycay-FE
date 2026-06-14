import { describe, it, expect } from "vitest";
import { getMockTrip } from "@/lib/contract-mock/data";
import type { MealCard } from "@/lib/contract-mock/types";

function walkerLunchMeal(): MealCard {
  const trip = getMockTrip("t_sg");
  const day2 = trip?.days.find((d) => d.id === "d_2");
  const meal = day2?.moments.flatMap((m) => m.activities).find((a) => a.meal)?.meal;
  if (!meal) throw new Error("expected a Day 2 meal card in the Walker seed");
  return meal;
}

describe("Walker Day 2 allergy meal card", () => {
  const meal = walkerLunchMeal();

  it("leads with a tree-nut text label and a venue", () => {
    expect(meal.allergy_label).toMatch(/tree-nut/i);
    expect(meal.venue).toMatch(/Satay by the Bay/i);
  });

  it("has checked + confirm-on-the-day reasoning rows", () => {
    expect(meal.checked.length).toBeGreaterThan(0);
    expect(meal.confirm_on_day.length).toBeGreaterThan(0);
  });

  it("carries a bilingual ask-the-kitchen card (Mandarin + English)", () => {
    expect(meal.ask_kitchen.language).toMatch(/mandarin/i);
    expect(meal.ask_kitchen.english).toMatch(/nuts or nut oils/i);
    // The local phrase is non-empty and distinct from the English.
    expect(meal.ask_kitchen.phrase.length).toBeGreaterThan(0);
    expect(meal.ask_kitchen.phrase).not.toBe(meal.ask_kitchen.english);
  });

  it("labels every stall as flagged or lower-risk (text, not colour)", () => {
    expect(meal.stalls.length).toBeGreaterThan(0);
    for (const s of meal.stalls) {
      expect(s.label).toMatch(/flagged|lower/i);
      expect(["flagged", "lower"]).toContain(s.risk);
    }
  });

  it("has a confirm-before-you-order reminder and never says 'safe' / '100%'", () => {
    expect(meal.reminder?.confirm.length).toBeGreaterThan(0);
    const allText = JSON.stringify(meal);
    expect(allText).not.toMatch(/\bsafe\b|100%/i);
  });
});
