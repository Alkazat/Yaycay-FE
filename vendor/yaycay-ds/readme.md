# Yaycay — Design System

> **For families making memories.**
> A globally-scalable, family-friendly holiday planner with the heart and swagger of an
> early-2000s video-game box. Think *The Sims*, *RollerCoaster Tycoon*, *Theme Park* —
> glossy, chunky, sunlit, and bursting with the promise of adventure.

This repository is the single source of truth for the Yaycay brand across **product** (web app +
native), **marketing site**, **funnel & landing pages**, **drip-feed email**, and **paid social /
ad creative**. It contains the tokens, fonts, components, UI kits, and guidance an agent needs to
produce on-brand work without re-deriving the look every time.

---

## 1 · Brand context

**Yaycay** helps families plan holidays together — picking destinations, building day-by-day
itineraries, splitting the to-do list, and counting down to take-off. The product's job is to turn
the *admin* of a trip into part of the *fun*. The brand therefore never feels like a spreadsheet or
a booking engine; it feels like the box of a game you're excited to open on the carpet on a rainy
Saturday.

**Audience:** parents (28–45) planning trips for and with kids, plus the kids themselves, who
should find the product delightful. Tone must work for a stressed mum at 11pm *and* a seven-year-old
pointing at the screen.

**The "box-art" north star.** The logo is the whole thesis in one lockup: a **diamond shield badge**
holding a tiny **scene** (blue sky, a fat cream cloud, a golden sun, a sweep of teal water), with the
wordmark "Yaycay" in **chunky cream bubble letters** wearing a thick **royal-blue outline** and a
**3D extruded edge**, all anchored by a **glossy ribbon banner** reading *FOR FAMILIES MAKING
MEMORIES*. Every surface we design should feel like it was lifted off that box: saturated daylight
palette, thick confident outlines, parts that look pressable, and a sky-to-sunset glow behind it all.

### Sources provided
- `uploads/ChatGPT Image Jun 8, 2026, 04_26_46 PM.png` — the master logo / box-art lockup
  (copied to `assets/yaycay-logo.png`). **All colours in this system were sampled directly from it.**
- No codebase or Figma file was supplied; the system is derived from the logo + brand brief.
  *If a codebase or Figma exists, re-attach it so the UI kits can be reconciled with production.*

---

## 2 · Content fundamentals (voice & tone)

Yaycay talks like **an excited friend who has done this trip before and can't wait for you to go.**
Warm, breezy, a little cheeky — never corporate, never childish-for-the-sake-of-it.

| Principle | Do | Don't |
|---|---|---|
| **Person** | Speak to "**you / your family**". Refer to ourselves as "**we**" sparingly. | "Users may configure…" |
| **Energy** | Short, sunny, active. Lead with the payoff. | Long hedged sentences. |
| **Casing** | Sentence case for UI & body. **Display lockups and ribbons go UPPERCASE.** | TITLE CASE EVERYWHERE. |
| **Punctuation** | One exclamation mark max, and only when earned. Em-dashes for asides. | "Let's go!!! 🎉🎉🎉" |
| **Emoji** | **Avoid in product UI and marketing copy.** The brand's "emoji" are its illustrated icons and badges. (A single ✦/★ sparkle as a *graphic* element is fine.) | Emoji-as-bullets, emoji in headlines. |
| **Jargon** | Plain words. "Trip", "day plan", "packing list", "countdown". | "Itinerary optimisation engine". |

**Verbal motifs.** "Yay" is the brand's heartbeat — lean into the feeling of *yay*, not the literal
word in every sentence. Adventure verbs: *plan, pack, go, explore, discover, count down, make
memories.* The tagline **"For families making memories"** is sacred — never reword it.

**Examples (use these as a yardstick):**
- Hero: **"Plan the trip. Skip the stress. Keep the yay."**
- Empty state: "No trips yet — let's plan your first adventure."
- Button: "Start a trip" · "Add a day" · "Pack it" · "Count me in"
- Success toast: "Saved! Your day plan is looking great."
- Email subject: "8 sleeps to go ☀ here's your packing list" *(the ☀ is a brand glyph, used rarely)*
- Error: "Hmm, that didn't save. Give it another go?"

**Numbers & countdowns.** Trips are emotional — we count in **"sleeps"** ("12 sleeps to go"), show
warm progress ("Day 3 of 7 planned"), and celebrate completion. Never present a date as a cold ISO
string in UI; format it human ("Sat 12 Jul").

---

## 3 · Visual foundations

The look is **saturated daylight**: bright primaries, warm cream paper, thick ink outlines, and
chunky depth. Restrained where it counts (lots of cream breathing room) so the colour pops.

### Colour
- **Sky `#2A96D8`** is the primary — buttons, links, brand fields. **Royal `#0A4C8B`** is the *ink*:
  every signature outline, extrude, and headline edge. **Sunshine `#F7AA15`** is the CTA / "go" colour
  and the only warm primary. **Aqua `#2BC3D0`** and **Meadow `#46B25E`** are supporting accents;
  **Coral `#FF6F4D`** is the hot accent (tickets, alerts, sale flags). **Cream `#FBF7EC`** is the page.
- Backgrounds are **warm cream**, never pure white pages (cards may be white). White-on-cream + a
  royal outline is the default card recipe.
- Imagery is **warm, sunny, high-saturation** — golden-hour skies, turquoise water, green hills. No
  cold/desaturated/B&W photography; no moody filters. A subtle warm grade unifies stock.
- Full token set: `tokens/colors.css`.

### Type
- **Fredoka** (display) — rounded, bubbly, geometric. Used for headlines, the wordmark voice,
  eyebrows, numbers, buttons. Weights 500–600 for most display; 600 for hero.
- **Nunito** (body/UI) — rounded terminals, friendly and very legible. 400 body, 600–700 for UI
  labels and emphasis, 800 for stat figures.
- Pairing rule: **Fredoka for the fun, Nunito for the facts.** Never set long paragraphs in Fredoka.
- Scale & helpers: `tokens/typography.css`.

### The "box-art" treatment (signature)
The hero brand effect = **chunky outlined extruded lettering**: cream fill, thick royal stroke, a
hard offset shadow to fake a 3D bevel, and a soft drop below. Reserved for big moments (hero
headlines, the wordmark, splash screens) — not body or dense UI. See the **Brand** specimen cards and
`.yc-boxart` usage in component prompts.

### Depth, shadows & "pop"
Two shadow families:
1. **Pop shadows** (`--pop-*`) — a *hard, solid, offset* shadow in the element's own darker shade
   (e.g. a sky button sits on `0 5px 0 royal`). This is what makes buttons, badges, and chips look
   **pressable**, like game UI. On press they **translate down** and the pop shadow shrinks.
2. **Ambient shadows** (`--shadow-*`) — soft blue-tinted blurs for floating cards, dialogs, popovers.
Cards often use **both**: thick royal outline + soft ambient lift.

**Gloss.** Buttons and badges carry an **inset top highlight** (`--gloss-top`) — a 1–2px white sheen
along the top edge that reads as a glossy plastic/candy surface. Core to the era.

### Shape & line
- **Generous radii** — controls are pill or `--radius-lg`+; cards `--radius-xl`/`2xl`. Nothing is
  sharp. There's a `--radius-blob` for soft cloud shapes.
- **Thick outlines** — the `--border-ink` (2.5px royal) stroke is the brand's pen. Use it on cards,
  buttons, inputs, badges. Outlines are **royal**, never grey, on hero/brand surfaces.

### Motion
- **Bouncy and tactile.** Default ease is `--ease-bounce` (slight overshoot) for entrances, toggles,
  and hovers; `--ease-out` for dismissals. Durations 120/220/420ms.
- Hover = **lift + brighten** (translateY(-2px), shadow grows). Press = **push down** (translateY to
  near-zero, pop shadow shrinks to `--pop-*-sm`). Cards/badges may **wobble** subtly on hover.
- Celebrations (trip created, countdown hits 0) may use a **pop-in + sparkle**; never gratuitous
  looping animation on content.
- Always respect `prefers-reduced-motion`.

### Layout
- Warm cream canvas, content in centered containers (`--container-*`). Big section rhythm
  (`--section-y`). Sky and sunset **gradient bands** (`--grad-sky`, `--grad-scene`) section off hero
  and footer zones. Decorative **cloud blobs** and a soft **scene horizon** are the recurring backdrop
  motifs — not flat colour fields and not busy patterns.
- Transparency/blur used sparingly: a frosted royal scrim (`--surface-overlay`) behind dialogs; light
  glass on sticky headers over photos. Not a primary motif.

Full effect tokens: `tokens/effects.css`.

---

## 4 · Iconography

- **Primary icon set: [Lucide](https://lucide.dev) via CDN**, used at **stroke-width 2.5** to match
  the brand's thick-outline pen. Rounded linecaps/joins (Lucide's default) suit the bubbly geometry.
  This is a **documented substitution** — no bespoke icon set was supplied. *If a production icon set
  exists, swap it in and update this section.*
  ```html
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
  <!-- <i data-lucide="plane" style="stroke-width:2.5"></i> then lucide.createIcons() -->
  ```
- **Brand glyphs / spot illustrations** carry more weight than UI icons here: the **diamond badge**,
  **cloud blob**, **sun**, **water arc**, and **ribbon** from the logo are reusable graphic atoms
  (see `assets/`). Prefer an illustrated badge over a thin line icon for hero/empty-state moments.
- **Emoji:** not used as UI. A few **brand glyphs** (☀ sun, ✦ sparkle, ★ star) may appear sparingly
  as *graphic* accents (e.g. an email subject line), never as functional iconography.
- Never hand-roll bespoke SVG icons inline when Lucide covers it; reserve custom SVG for the brand
  shapes above.

---

## 5 · Index / manifest

**Root**
- `styles.css` — global entry point (import this). `@import`s the token files below.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill front-matter wrapper.

**Tokens** (`tokens/`)
- `fonts.css` — `@font-face` for Fredoka & Nunito (binaries in `assets/fonts/`).
- `colors.css` · `typography.css` · `spacing.css` · `effects.css` · `base.css`.

**Assets** (`assets/`)
- `yaycay-logo.png` — master box-art lockup (white bg).
- `brand/yaycay-logo-transparent.png` — trimmed, transparent lockup for any surface.
- `fonts/` — Fredoka + Nunito webfont binaries (woff2).

**Foundations / specimens** (`guidelines/`) — populate the Design System tab:
- *Colors:* sky, royal, sunshine, accents, coral, cream, semantic. *Type:* Fredoka, Nunito, scale.
- *Spacing:* scale, radii, shadows. *Brand:* logo, logo-on-backgrounds, box-art lettering, gradients.
- *Marketing:* `marketing-email.html`, `ad-square.html`, `ad-story.html`.

**Components** (`components/`) — React primitives, each `.jsx` + `.d.ts` + `.prompt.md` + a card:
- `buttons/` — **Button**, **IconButton** · `forms/` — **Input**, **Select**, **Checkbox** (+radio), **Switch**
- `display/` — **Badge**, **Tag**, **Avatar**/**AvatarGroup** · `surfaces/` — **Card** (+Media/Body/Footer), **Stat**, **ProgressMeter**
- `navigation/` — **Tabs** · `feedback/` — **Banner**

**UI kits** (`ui_kits/`)
- `app/` — the trip-planner product (home, planner, packing, budget, new-trip flow).
- `web/` — the marketing site (box-art hero, how-it-works, destinations, testimonial, CTA, signup).

> Components are consumed in card/kit HTML via the generated `_ds_bundle.js` and
> `window.YaycayDesignSystem_*`. When you add or move files, update this index.
