# Yaycay Admin - Handoff

**Repo:** `github.com/Alkazat/Yaycay-Admin`
**Read `00-MODEL-CONTEXT.md`, `00-LANDSCAPE-ADDENDUM.md`, and the BE handoff
first.** Admin is a client of the **admin-scoped** contract; it never bypasses
the API. Writing rule: no em-dashes.

---

## Mission

The internal operations console: manage the AI prompt/model harness, review and
QA AI-generated content (allergy-safety above all), configure the reward economy
and catalogue, troubleshoot jobs and accounts, and keep an auditable record. Off
its own domain, MFA-gated, least-privilege.

## Scope

**In:** prompt + model management; content QA / moderation and publish gates; AI
job monitoring and the daily cap; reward-economy configuration; product/price
management surfaces; account/trip troubleshooting (read-mostly, scoped writes);
the audit log; safety governance.

**Out:** the customer experience (FE); building the AI harness or the contract
(BE); writing the prompts themselves day to day (AI-prompts thread authors,
Admin curates and selects models/versions).

## Stack & access model

- TypeScript; same design system tokens but an internal, denser admin skin.
- **Off-domain**, its own host. **MFA mandatory** for every admin.
- Auth: standard Yaycay sign-in then `aal === 'aal2'`. **Role is server-resolved**
  (`identity.accounts.role = 'admin'`), not a JWT claim. Admin never trusts a
  client-side role.
- Every `/admin/*` write is logged to the append-only `public.admin_audit_log`
  via the service role. Admin assumes its actions are recorded.

---

## Core surfaces

### 1. Prompt & model management

- Browse/edit the **versioned prompt harness** (`prompts`): each generation task
  (demo day, full trip, per-mode variants, typed challenges, facts, star
  challenges, mini-game themes, packing, grown-ups logistics, allergy-safety;
  see `04-AI-PROMPTS-HANDOFF.md`).
- Per task: select the **model** (default Claude Sonnet for use-our-AI), pin a
  prompt **version**, see diffs, and roll back. Model + version are stored with
  every `ai_jobs` run so output is traceable.
- Safe rollout: stage a prompt version, run it against golden inputs (see QA),
  promote on green.

### 2. Content QA / publish gate (safety-critical)

AI generates a family's trip; Admin is the human gate before sensitive content is
trusted. Priorities:

- **Allergy / anaphylaxis correctness is the top QA rule.** Any activity touching
  food for a child with anaphylaxis flags must carry a correct `safety` block
  (avoid-list, cross-contamination, EpiPen note). Admin can flag, require
  regeneration, or hand-correct. Treat a missing or wrong allergy callout as a
  release blocker.
- Age-appropriateness per mode (`little` reading age, `explorer_plus` depth),
  factual accuracy, date/year consistency (the prototype shipped a "2025" bug -
  add a year/consistency check to the QA list), tone (kid-first, warm, sentence
  case, no em-dashes), and that **every mode's variant exists** (the prototype
  orphaned Explorer+).
- Publish/unpublish a trip's content; require QA pass before paid delivery.

### 3. Reward-economy configuration

- Set the **star value** (e.g. 1 star = 3 SGD) and any caps (one star per child
  per day, per source). View per-family star ledgers; correct erroneous
  grants/claims with an audited adjustment.
- These are levers that affect spend; changes are audited and ideally two-person
  for production.

### 4. Jobs & troubleshooting

- Monitor `ai_jobs`: model, prompt version, status, cost, and the **~10 AI
  updates/day per trip** cap; see queued/manual-fallback states; retry safely.
- Account/trip troubleshooting: look up an account (admin scope), inspect a
  trip's content/progress/journal counts, entitlement/`purchases` state, and
  retention (`retention_expires_at`, `data_kept`). Fix entitlement mismatches
  from Stripe via scoped, audited actions.
- Connector status (BYO-AI) for support.

### 5. Catalogue

- View/manage the product catalogue surfaced from Stripe price IDs
  (`price_holiday_byo`, `price_holiday_ai`, `price_datakeep_annual`,
  `price_destination_addon`, `price_explorerplus`, `price_photobook`,
  `price_gift`) and how they map to entitlement.

---

## Safety & privacy governance

- Allergy/medical data is sensitive: Admin views it only where needed for QA,
  under audit, never exported casually. RLS still applies; admin breadth is a
  deliberate, logged exception, not a backdoor.
- Children's data is parent-owned and minimised; Admin honours deletion and
  retention.
- No customer PII leaves the console without a logged, purposeful action.

## Testing

- Vitest (unit), Playwright (E2E) for the admin flows; assert the MFA/role gate
  and the audit-write on every mutating action.
- Golden-input QA harness for prompt versions (shared definition with the
  AI-prompts thread): allergy red-team set, age-appropriateness set, factual and
  date-consistency checks.

## Definition of done

An admin can sign in with MFA, manage prompts/models with versioned rollback,
gate AI content on a QA pass (with allergy correctness enforced), configure the
star economy and catalogue, monitor jobs against the daily cap, troubleshoot an
account/trip within scope, and have every write audited - all off-domain and
least-privilege.

## Handshake

- Consume the **admin-scoped** contract from BE; a needed field/endpoint is a PR
  on `Yaycay-BE`.
- Prompt content is authored with the AI-prompts thread; Admin owns selection,
  versioning, QA gating, and rollout.
