import { NextResponse } from "next/server";
import type { CheckoutRequest } from "@/lib/contract-mock/types";

/**
 * MOCK Checkout-session creator. The real BE creates a Stripe Checkout session
 * and returns its hosted URL; card data never touches the FE. Here we return a
 * local placeholder page so the redirect flow can be built and tested.
 */
export async function POST(request: Request) {
  let body: Partial<CheckoutRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.price_id) {
    return NextResponse.json({ error: "price_id is required" }, { status: 422 });
  }

  const params = new URLSearchParams({ price_id: body.price_id });
  if (body.trip_id) params.set("trip_id", body.trip_id);
  return NextResponse.json({ url: `/checkout/mock?${params.toString()}` });
}
