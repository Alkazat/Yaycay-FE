# BE/ops: checkout returns 422 (price_id is not a live Stripe price)

**From:** Yaycay-FE. **For:** Yaycay-BE / ops. **Date:** 2026-06-17.
**Severity:** blocks all paid purchases (no one can reach Stripe Checkout).

## Symptom

Creating a paid trip creates the trip, then `POST /checkout/session` returns
**HTTP 422** and the user never reaches Stripe. Reproduced in production from the
New Trip modal ("Full holiday - our AI", US$129).

## What the FE sends

```
POST /checkout/session
Authorization: Bearer <parent JWT>
apikey: <anon>
Content-Type: application/json

{ "price_id": "price_holiday_ai", "trip_id": "<id>", "code": "<affiliate?>" }
```

`price_id` is the contract **ProductId catalogue key** (`price_holiday_ai`,
`price_holiday_byo`, `price_datakeep_annual`, ...) from `lib/paywall.ts`.

## The mismatch

`@alkazat/contracts` `CheckoutSessionRequest.price_id` is documented as:

> "The Stripe price id of a known, active catalogue product."

So the BE expects a **real Stripe price id** (e.g. `price_1QabcXYZ...`), but the FE
(per our shared catalogue keys) sends the **catalogue key** `price_holiday_ai`.
The BE can't resolve that to an active Stripe price, hence 422.

## Resolve it one of two ways (pick one and tell us)

**Option A - BE maps the catalogue keys (recommended, no FE change).**
`POST /checkout/session` accepts the contract ProductId keys and maps each to its
live Stripe price server-side:

| Key | Live Stripe price | Amount |
| --- | --- | --- |
| `price_holiday_ai` | `price_…` (ops to fill) | US$129 |
| `price_holiday_byo` | `price_…` | US$59 |
| `price_datakeep_annual` | `price_…` | ~US$9/yr |

This keeps the keys stable and hides Stripe ids from the client.

**Option B - FE sends real Stripe price ids via the live catalogue.**
Ship `GET /catalogue` (still missing - `SERVED.catalogue = false`) returning each
product's **real Stripe `price_id`** plus a stable `product` discriminator so the
FE knows which is the holiday-AI vs BYO plan, e.g.:

```
{ "products": [
  { "product": "holiday_ai",  "price_id": "price_1Q…", "name": "Full holiday - our AI",  "price_usd": 129 },
  { "product": "holiday_byo", "price_id": "price_1Q…", "name": "Full holiday - your AI",  "price_usd": 59 }
] }
```

Then the FE sends the catalogue's real `price_id` to checkout. (Today the FE has
no way to learn the real Stripe id, so it falls back to the key.)

## Either way, ops must confirm

- The three prices exist as **live-mode** Stripe prices (not test).
- The webhook that grants entitlement is wired for live mode.

## Verify (BE)

```
curl -i -X POST "$API_BASE/checkout/session" \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"price_id":"price_holiday_ai","trip_id":"<id>"}'
# Expect 200 { "url": "https://checkout.stripe.com/…", "session_id": "cs_…" }
```

FE is ready for both options: it already reads `GET /catalogue` for display
pricing (flip `SERVED.catalogue` when live), and the New Trip modal now surfaces
the real checkout error/status so this is diagnosable from the UI.
