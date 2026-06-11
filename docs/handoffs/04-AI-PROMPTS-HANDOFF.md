# Yaycay AI Prompts - Handoff

**Thread:** the prompt harness (authored with BE; curated/selected in Admin).
**Read `00-MODEL-CONTEXT.md`, `00-LANDSCAPE-ADDENDUM.md`, and the BE handoff
first.** Writing rule: no em-dashes (it applies to generated copy too).

---

## Mission

Turn a destination, dates, and a family (children with ages, modes, interests,
and dietary/medical flags) into the entire holidaying experience as
**schema-valid `trip_content`**: days, moments, activities with per-mode
variants, challenges, facts, star challenges, mini-games, packing lists, the
grown-ups logistics guide, and a correct allergy-safety layer. Model-agnostic;
default model for use-our-AI is **Claude Sonnet**; the chosen model and prompt
version are stored with every `ai_jobs` run.

## Operating rules

- **Output is a contract, not prose.** Every task emits JSON that validates
  against `trip-content.schema.json` (or the task's input schema). BE rejects
  invalid output; design prompts to fail closed and self-validate.
- **No invented contract.** Only emit fields the schema defines. A needed field
  is a contract change (PR on BE), never an ad-hoc key.
- **Determinism where it matters:** stable `id`s for days/moments/activities so
  progress (keyed by activity id) survives regeneration; do not key anything by
  label text.
- **Bounded:** generation and ingestion run within the ~10 AI updates/day per
  trip cap; design tasks to do meaningful work per call.

## Generation tasks (each a versioned prompt)

1. **Demo day** (`POST /demo/generate-day`). One day, one person, one quiz, plus
   a grown-ups teaser. Includes `trip.start_date` + IANA `timezone` so the FE can
   count down. The "one AI action" is never advertised.

2. **Full trip content.** Holiday -> Days -> Moments -> Activities for the whole
   stay, paced by accommodation phases and travel days, age-pitched, with
   did-you-know intros, fact bubbles, scene/setting copy, hotel/move badges, and
   weather notes.

3. **Per-mode variants** for each activity:
   - `standard`: baseline copy.
   - `little`: simpler, read-aloud copy (short sentences, concrete nouns, gentle
     pacing), suitable for the youngest; no challenge blocks.
   - `explorer_plus`: a deeper fact plus a harder quiz, and a per-day reflective
     capture prompt. **Always produce all three** (the prototype orphaned this).

4. **Typed challenges** per activity: `quiz` | `spot` | `photo` | `challenge`,
   each with a question and an answer. The answer is never part of read-aloud
   copy. Variety across the trip (spotter bingo, photo battles, foodie dares,
   review quizzes).

5. **Star challenges** per child, per day: age-differentiated question + answer.
   Older children get harder, more factual prompts; younger get concrete,
   observational ones. One claimable star per child per day.

6. **Mini-game themes** per day: choose a type (tap-to-collect / colouring /
   spot-it) and a theme tied to that day's itinerary, with the config the FE
   game needs (emoji set, goal, target/decoy lists).

7. **Packing lists**: per child and a shared family list, sectioned, trip-,
   age-, and weather-aware, with quantities and notes (reef shoes, comfort toy,
   medications, documents with placeholders for refs the family fills in).

8. **Grown-ups logistics**: per-day bookings, multi-currency cost estimates,
   transport with fare guidance, tips (crowd patterns, opening days), and the
   booking checklist seed grouped by urgency.

9. **Allergy / safety layer (safety-critical).** When a child carries
   anaphylaxis or other dietary flags, attach a `safety` block to every relevant
   food activity and venue: avoid-list, cross-contamination guidance, buffet /
   restaurant flagging, and an EpiPen-on-the-table reminder, plus packing entries
   (antihistamines, snacks). See guardrails below.

10. **Ingestion**: receipt / photo / booking text or image -> a structured
    itinerary update (add/move/update activity, set packing item), schema-valid,
    within the daily cap.

11. **Map / geo**: ensure each venue carries `location { name, lat, lng, zoom }`
    for the activity map deep-link.

## Guardrails

- **Allergy guidance is safety, not flavour.** Be specific and conservative:
  state the avoid-list and cross-contamination risk, advise confirming with the
  venue and ordering one dish at a time, and always include the EpiPen reminder.
  When unsure whether a dish/venue is safe, say so and advise caution rather than
  asserting safety. Never present allergy guidance as definitive medical advice;
  it supplements, not replaces, the family's own care. Flag low-confidence
  venues for Admin QA.
- **Child-appropriate and kind.** No frightening, unsafe, or adult content in kid
  copy. Read-aloud copy avoids hard-to-pronounce constructions.
- **Factual and current.** Verify dates against the trip window; do not hard-code
  years (the prototype shipped "2025" into a 2026 trip). Avoid stale labels.
- **Brand voice.** Warm, breezy, sentence case in UI copy; one exclamation mark
  max; no emoji as functional UI; no em-dashes. Tagline never reworded: "For
  families making memories."
- **Privacy.** Never echo a family's PII into shared/cacheable content; keep
  medical flags inside the `safety` blocks for that trip only.
- **Reading age per mode** is a hard constraint, not a suggestion.

## Output & evaluation

- Each prompt declares its output schema and includes a self-check step;
  generation that cannot validate returns a structured error, not malformed JSON.
- **Eval suites (shared with Admin's QA gate):**
  - *Allergy red-team*: known-allergen venues must always yield a correct
    `safety` block; planted unsafe suggestions must be caught.
  - *Age-appropriateness*: `little` vs `explorer_plus` reading-age checks.
  - *Coverage*: every activity has all three mode variants; every day has a game
    and (for older children) a star challenge.
  - *Consistency*: dates/years match the trip window; ids are stable across
    regeneration; no label-keyed state.
  - *Tone/format*: sentence case, no em-dashes, tagline intact.
- Every run is logged in `ai_jobs` with model + prompt version for traceability
  and rollback.

## Definition of done

For any destination + dates + family, the harness produces schema-valid content
covering all modes and all feature domains, with allergy-safety correct and
QA-passable, within the daily cap, traceable to a model + prompt version, on the
brand and in the right reading age - ready for BE to persist and FE to render.

## Handshake

- Prompts emit only what the contract schema defines; a gap is a PR on
  `Yaycay-BE` to evolve the schema, then the prompt.
- Admin owns model selection, version pinning, QA gating, and rollout; this
  thread authors and improves the prompts and their evals.
