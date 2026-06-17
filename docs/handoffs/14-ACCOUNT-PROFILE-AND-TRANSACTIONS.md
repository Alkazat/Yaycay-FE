# BE spec: account profile name + Stripe-sourced transactions

**From:** Yaycay-FE. **For:** Yaycay-BE. **Date:** 2026-06-17.
**Why:** the Settings page now edits a display **name** alongside the recovery
email, and the **Transaction history** is a real table with a per-trip column.
Both are mock-backed today; this is what BE needs to ship to make them live.
Writing rule: no em-dashes.

## 1. Account display name (`GET` + `PATCH /account`)

Add a consumer-editable **`name`** to the account:

- `AccountSummary` gains `name: string | null`.
- `AccountUpdate` gains `name?: string | null` (send `null` to clear).
- FE already sends `{ name, secondary_email }` on save and re-reads `GET /account`.
- Login `email` stays server-owned (changed via the auth flow), shown read-only.

Until this ships, `name` is mock-backed: the FE types it locally as
`AccountProfile = AccountSummary & { name }` (see `lib/api/account.ts`) and the
mock `PATCH /account` persists it in-memory. No FE change needed when BE adds the
field; just remove the local extension once it lands in the contract.

## 2. Transaction history from Stripe (`GET /account/transactions`)

Today this is fully mock (`SERVED.transactions = false`) and, as flagged, it does
not read from Stripe. BE needs to ship the real endpoint, sourced from Stripe.

- Source: the customer's Stripe charges / payment intents / invoices. Do not
  hand-maintain this list; read it from Stripe so it can never look fake.
- Response shape (FE `Transaction`, in `lib/api/transactions.ts`):
  ```
  {
    "transactions": [
      {
        "id": "txn_...",            // your id or the Stripe object id
        "date": "2026-05-20T09:14:00.000Z",
        "description": "Holiday - full (our AI planning)",
        "amount_usd": 129,
        "status": "paid" | "refunded" | "pending",
        "trip_id": "t_sg" | null,   // the trip this charge bought, when applicable
        "trip_name": "Singapore" | null
      }
    ]
  }
  ```
- **`trip_id` is the headline ask:** every checkout the FE starts already carries
  `trip_id` (`POST /checkout/session` includes it). Persist that on the Stripe
  object (metadata) at session creation, then echo it back here so the FE can show
  a "Trip" column linking to `/trips/:id`. Lines with no trip (e.g. account-level
  charges) send `trip_id: null`.
- `amount_usd` is a number of dollars (the FE formats currency). If you prefer
  minor units, tell us and we will switch the field to `amount_cents`.

## FE flip checklist

| Endpoint | FE flag | Drop mock |
| --- | --- | --- |
| `GET`/`PATCH /account` (with `name`) | `SERVED.account` | remove local `AccountProfile` extension + mock `name` handling |
| `GET /account/transactions` (Stripe, with `trip_id`) | `SERVED.transactions` | `app/api/account/transactions` |
