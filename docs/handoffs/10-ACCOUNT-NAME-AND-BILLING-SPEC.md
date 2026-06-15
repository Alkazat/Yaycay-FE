# BE spec: account name + transaction history

**From:** Yaycay-FE. **For:** Yaycay-BE / ops.
**Why:** the Settings overhaul wants an editable **Name** and a **Transaction
history** list. Neither exists in `@alkazat/contracts` today, so the FE built
around them (Name omitted; transactions mock-backed). Two small additions unblock
both. Writing rule: no em-dashes.

## 1. Account name (small contract change)

`AccountSummary` has no `name`, and `AccountUpdate` only accepts
`secondary_email`. Please add:

- **`AccountSummary.name: string | null`** (returned by `GET /account`).
- **`AccountUpdate.name?: string | null`** (accepted by `PATCH /account`;
  `null`/`""` clears, trims, reasonable length cap).
- **Not required at sign-up** - sign-up still needs only email. Name is an
  optional profile field set later in Settings.

FE is ready to wire the Name editor (same pattern as the recovery-email editor)
the moment these land; today it is intentionally omitted rather than faked.

## 2. Transaction history (new endpoint)

We do checkout via Stripe (`POST /checkout/session`), but there is no way to read
a customer's purchase history. Please add:

- **`GET /account/transactions` -> `{ transactions: Transaction[] }`**
- **`Transaction`**: `{ id: string; date: string /* ISO 8601 */;
  description: string; amount_usd: number; status: 'paid' | 'refunded' | 'pending' }`
- **Source:** the `purchases` table (set by the Stripe webhook) or Stripe
  charges/invoices directly. Newest first.
- **Auth:** parent JWT (`Authorization: Bearer`) + anon `apikey`, `verify_jwt=true`
  (same as `GET /account`). Returns only the caller's own transactions.
- **Live path** if deployed as its own Edge Function:
  `.../functions/v1/account-transactions` (tell us the exact name; we pass it as
  `livePath`, like `media-sign-upload`).

FE flips `SERVED.transactions = true` and drops the mock route the moment this is
live. Current FE shape is in `lib/api/transactions.ts`.

## 3. Price catalogue (no action - confirming we have it)

For the paywall wiring the FE uses the contract `ProductId` catalogue keys, BE
maps them to live Stripe prices:

| Flow | `price_id` | Price |
| --- | --- | --- |
| Holiday, our AI chat | `price_holiday_ai` | US$129 |
| Holiday, BYO-AI | `price_holiday_byo` | US$59 |
| Keep data, +12 months | `price_datakeep_annual` | ~US$9/yr |
| Destination add-on | `price_destination_addon` | - |
| Photobook | `price_photobook` | - |

Only ask here: confirm those keys exist as **live** Stripe prices (ops created
them per `OPS-OUTSTANDING`), so the paywall buttons resolve in production.
