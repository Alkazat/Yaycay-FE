# BE / AI: make the demo "real" (stop falling back)

> Drafted by the FE thread from live observation. Copy into a `Yaycay-BE` issue.
> Writing rule: no em-dashes.

## What we see (production)

`POST /functions/v1/demo-generate-day` is **live and the FE renders it correctly**,
but the same call for different destinations returns essentially identical,
templated content with only the destination and child name substituted in. Two
real responses:

- Singapore: "Singapore explorer walk" / "Spot five hidden things" / "A gentle
  morning wander to wake up in Singapore." / "Family lunch / Try one new local
  dish" / "Carmen's treasure hunt".
- "Florence Italy": the same lines, word for word, with "Florence Italy"
  swapped in.

The response's `generated_by` is returning **`fallback`**, not `ai` (the FE now
shows a "Sample day" vs "Built by Yaycay AI" badge so this is visible at a
glance).

## Diagnosis

This is the BE **fallback template**, not a model generation. The demo's "one AI
action" is either not invoking the model or erroring and falling back. The FE is
not the bottleneck: it already renders the rich fields when present (per-mode
`variants`, `facts[]`, typed `challenge`, `did_you_know`, longer `body`, the
allergy `safety` block). The fallback payload simply does not contain them.

## What we need from the demo generation

For a given `{ destination, child: { name, age?, mode?, interests?, dietary? }, date? }`,
produce a schema-valid `Day` that is:

- **Specific to the destination** (real spots/areas, local food, a local-flavour
  fact), not a template with the name slotted in.
- **Long-form and varied** across runs and destinations (different titles/copy).
- **Rich**: a `did_you_know`, at least one `facts[]` entry, a typed `challenge`
  (with answer), and per-mode `variants` so the explorer modes have something to
  show. The demo renders in `explorer_plus`, so include that variant's fact +
  quiz.
- **Allergy-aware**: if `child.dietary` / `medical` indicate an allergen, attach
  a `safety` block to any food activity (avoid-list, cross-contamination, EpiPen
  reminder). This is safety-critical (see `04-AI-PROMPTS-HANDOFF.md`).
- **`generated_by: "ai"`** on success; only fall back on a real model failure,
  and treat a high fallback rate as an alert.

The prompt spec is already written in `04-AI-PROMPTS-HANDOFF.md` (demo + per-mode
variants + typed challenges + allergy guardrails). The ask here is operational:
get the demo path actually calling the model and returning that richer payload
instead of the static template.

## FE status

Nothing required on the FE. It renders whatever schema-valid content the harness
returns and now surfaces `generated_by`. The moment the demo returns real AI
content, it will display in full.
