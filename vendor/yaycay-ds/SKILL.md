---
name: yaycay-design
description: Use this skill to generate well-branded interfaces and assets for Yaycay, the family-friendly holiday planner, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping with the early-2000s "game box-art" Yaycay look.
user-invocable: true
---

Read the `readme.md` file within this skill first — it is the full brand guide (context, content
voice, visual foundations, iconography, and a file index). Then explore the other files:

- `styles.css` + `tokens/` — link `styles.css` to inherit every colour, type, spacing, radius,
  shadow and gradient token, plus the Fredoka + Nunito webfonts.
- `components/` — reusable React primitives (Button, Card, Badge, Tabs, Input, ProgressMeter, …),
  each with a `.prompt.md` showing usage. In static HTML, load the compiled `_ds_bundle.js` and read
  components off `window.YaycayDesignSystem_*` (run the design-system check to confirm the exact
  namespace), or just lift the styling patterns.
- `ui_kits/app` + `ui_kits/web` — full-screen recreations of the product and marketing site to copy
  from.
- `guidelines/` — foundation specimen cards plus marketing samples (drip email, square + story ads)
  and the signature box-art lettering recipe.
- `assets/` — the logo (full + transparent) and webfont binaries.

If creating visual artifacts (slides, mocks, throwaway prototypes, emails, ad creative), copy assets
out and produce static HTML files for the user to view. If working on production code, copy assets
and apply the rules here to design as a Yaycay brand expert.

If the user invokes this skill without other guidance, ask what they want to build, ask a few
focused questions, then act as an expert designer who outputs HTML artifacts **or** production code,
depending on the need. Keep the voice warm and sunny, lean on the chunky outlined / glossy "pop"
look, and never reword the tagline **"For families making memories."**
