import type { ProductId } from "@/lib/contract-mock/types";

/**
 * The checkout catalogue. `id` is the contract `ProductId` (a logical key); BE
 * maps it to a live Stripe price. Prices are USD and shown in the UI; the charge
 * is authoritative on Stripe/BE. Keep amounts in sync with the catalogue.
 */
export interface Product {
  id: ProductId;
  name: string;
  priceUsd: number;
  blurb: string;
}

export const PRODUCTS = {
  ours: {
    id: "price_holiday_ai",
    name: "Full holiday - our AI",
    priceUsd: 129,
    blurb: "Plan with our guardrailed AI chat. Every day unlocked, journal, photos and offline.",
  },
  byo: {
    id: "price_holiday_byo",
    name: "Full holiday - your own AI",
    priceUsd: 59,
    blurb: "Connect your own ChatGPT, Claude or Gemini. Every day unlocked, journal and offline.",
  },
  datakeep: {
    id: "price_datakeep_annual",
    name: "Keep your memories",
    priceUsd: 9,
    blurb: "Hold onto this trip's memories for another 12 months.",
  },
} as const satisfies Record<string, Product>;

export type ProductKey = keyof typeof PRODUCTS;
