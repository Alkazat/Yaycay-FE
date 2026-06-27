import { NextResponse } from "next/server";
import type { CostsResponse } from "@/lib/contract-mock/types";

/** MOCK itemised trip costs. Active until NEXT_PUBLIC_API_BASE is set. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const now = new Date().toISOString();

  const costs: CostsResponse = {
    costs: [
      {
        id: "cost_1",
        trip_id: id,
        reservation_id: "res_hotel_1",
        day: "day_1",
        node_ref: "hotel_checkin",
        label: "Hotel check-in – night 1",
        amount_base: 3200,
        amount_home: 142.22,
        currency_base: "THB",
        currency_home: "AUD",
        paid: true,
        notes: null,
        created_at: now,
        updated_at: now,
      },
      {
        id: "cost_2",
        trip_id: id,
        reservation_id: null,
        day: "day_1",
        node_ref: "moment_lunch",
        label: "Lunch at street market",
        amount_base: 350,
        amount_home: 15.56,
        currency_base: "THB",
        currency_home: "AUD",
        paid: false,
        notes: "Estimate only",
        created_at: now,
        updated_at: now,
      },
      {
        id: "cost_3",
        trip_id: id,
        reservation_id: "res_tour_1",
        day: "day_2",
        node_ref: "moment_temple_tour",
        label: "Temple tour entrance + guide",
        amount_base: 800,
        amount_home: 35.56,
        currency_base: "THB",
        currency_home: "AUD",
        paid: true,
        notes: null,
        created_at: now,
        updated_at: now,
      },
    ],
  };

  return NextResponse.json(costs);
}
