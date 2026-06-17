# BE verification checklist: flip the FE fully live

**From:** Yaycay-FE. **For:** Yaycay-BE / ops.
**Date:** 2026-06-15.
**Why:** the trips/planning fix batch shipped to `main`. A few surfaces are still
**mock-backed** behind per-endpoint `SERVED` flags (`lib/api/http.ts`) because the
contract/endpoint is not live yet. This is the single list to work through; tick a
box, FE flips the flag, that surface goes live. Writing rule: no em-dashes.

How the hybrid switch works: an endpoint hits the live BE only when
`NEXT_PUBLIC_API_BASE` is set **and** its `SERVED` flag is `true`. Everything below
is currently `false` (or contract-absent), so it serves the in-repo mock. When you
confirm an item, FE sets the flag `true` and deletes the matching mock route.

---

## 1. Price catalogue (dynamic Stripe pricing) - BLOCKS #1

New Trip + the paywall now read prices from a live catalogue instead of hardcoding.
Today they fall back to mock amounts.

- [ ] **`GET /catalogue` -> `{ products: CatalogueProduct[] }`**
- [ ] **`CatalogueProduct`**: `{ price_id: string; name: string; price_usd: number; blurb?: string }`
- [ ] `price_usd` is the **live Stripe unit amount in USD** (e.g. `129`), not cents.
- [ ] `price_id` values match the contract `ProductId` keys the FE sends to
      `POST /checkout/session` (table below).
- [ ] Auth: public/anon is fine (anon `apikey`); no parent JWT required.
- [ ] Live path if its own Edge Function: tell us the exact function name (e.g.
      `catalogue`) so we set `livePath`.

**Verify:**
```
curl -s "$API_BASE/catalogue" -H "apikey: $ANON" | jq
# expect: { "products": [ { "price_id": "price_holiday_ai", "name": "...", "price_usd": 129 }, ... ] }
```
FE action when green: `SERVED.catalogue = true`, drop `app/api/catalogue/route.ts`.
Shape lives in `lib/api/catalogue.ts`.

### Stripe price keys must exist as LIVE prices

| Flow | `price_id` | Expected |
| --- | --- | --- |
| Holiday, our AI chat | `price_holiday_ai` | US$129 |
| Holiday, BYO-AI | `price_holiday_byo` | US$59 |
| Keep data, +12 months | `price_datakeep_annual` | ~US$9/yr |
| Destination add-on | `price_destination_addon` | TBC |
| Photobook | `price_photobook` | TBC |

- [ ] Each key resolves to a **live-mode** Stripe price (not test), so checkout +
      catalogue both work in production.

---

## 2. Transaction history - BLOCKS #12 (Account > Transaction history)

Account settings shows a purchase history; mock-backed today.

- [ ] **`GET /account/transactions` -> `{ transactions: Transaction[] }`**
- [ ] **`Transaction`**: `{ id: string; date: string /* ISO 8601 */; description: string;
      amount_usd: number; status: 'paid' | 'refunded' | 'pending' }`
- [ ] Source: `purchases` table (Stripe webhook) or Stripe charges/invoices. Newest first.
- [ ] Auth: parent JWT + anon `apikey`, `verify_jwt=true` (same as `GET /account`).
      Returns only the caller's own transactions.
- [ ] Live path if its own Edge Function: exact name (e.g. `account-transactions`).

**Verify:**
```
curl -s "$API_BASE/account/transactions" -H "apikey: $ANON" -H "Authorization: Bearer $JWT" | jq
```
FE action when green: `SERVED.transactions = true`, drop the mock. Shape in
`lib/api/transactions.ts`.

---

## 3. Account name - BLOCKS #12 (Account > Settings)

Settings wants an editable Name. Not in the contract today, so the editor is omitted
rather than faked. Not required at sign-up (email-only sign-up stays).

- [ ] **`AccountSummary.name: string | null`** returned by `GET /account`.
- [ ] **`AccountUpdate.name?: string | null`** accepted by `PATCH /account`
      (`null`/`""` clears; trims; reasonable length cap).
- [ ] Published in a new `@alkazat/contracts` release (tell us the version).

**Verify:**
```
curl -s "$API_BASE/account" -H "apikey: $ANON" -H "Authorization: Bearer $JWT" | jq '.name'
curl -s -X PATCH "$API_BASE/account" -H "apikey: $ANON" -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" -d '{"name":"Dana Walker"}' | jq '.name'
```
FE action when green: bump the contracts dep + add the Name editor (same pattern as
the recovery-email editor).

---

## 4. Per-explorer feature toggles - CONFIRM (should already be live)

The planning workspace persists each explorer's enabled features to the BE
(`#89`, migration 0031). FE already runs with `SERVED.features = true` and degrades
to "no overrides" if a read fails.

- [ ] **`GET /trips/:id/features` -> per-explorer overrides** returns 200 in production.
- [ ] **`PUT /trips/:id/features`** persists and is reflected on the next read.
- [ ] Auth: parent JWT + anon `apikey`.

**Verify:**
```
curl -s "$API_BASE/trips/$TRIP/features" -H "apikey: $ANON" -H "Authorization: Bearer $JWT" | jq
```
If this 404s in prod, tell us and FE will degrade the flag until it deploys.

---

## 5. Destination autocomplete - NO BE ACTION

For info only: the New Trip destination picker now autocompletes "every city in the
world" via **Photon** (OpenStreetMap, keyless, browser-side), with a curated set as
the instant/offline fallback. No BE endpoint required. If you would rather route this
through your own geocoder later, it is a one-function swap in `lib/geo.ts`
(`GEOCODER`); no contract impact.

---

## Summary table

| # | Surface | Needs from BE | FE flag to flip | Status |
| --- | --- | --- | --- | --- |
| 1 | Dynamic pricing | `GET /catalogue` + live Stripe prices | `SERVED.catalogue` | [ ] |
| 2 | Transaction history | `GET /account/transactions` | `SERVED.transactions` | [ ] |
| 3 | Account name | `name` on AccountSummary/AccountUpdate | contracts bump | [ ] |
| 4 | Feature toggles | confirm `/trips/:id/features` in prod | already `true` | [ ] |
| 5 | City autocomplete | nothing (Photon) | n/a | done |

When 1-3 are ticked (and 4 confirmed), the FE has **zero** remaining mocks and the
whole experience is live end to end. Ping us with the function names/paths for any
endpoint deployed as its own Edge Function so we set `livePath` correctly.
