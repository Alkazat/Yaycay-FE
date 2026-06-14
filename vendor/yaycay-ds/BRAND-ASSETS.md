# Yaycay — Brand Assets & Logo Usage

> **The single source of truth for *which* Yaycay mark to use *where*.**
> This is the companion to `readme.md` (the full brand guide). `readme.md` tells you how the
> brand *feels*; this file tells you which logo file to reach for, at what size, on what
> background — and which mistakes to never make. **For families making memories.**

Every thread (FE, BE, Admin, Website) carries a copy of this file and treats it as canonical.
The master copies of the assets live here, in the design system:
`vendor/yaycay-ds/assets/brand/`. Each repo vendors the marks it needs into its own asset
folder (see §6). When you add a brand mark to a screen, an email, an icon slot, or an ad — pick
from this catalogue. Do not re-export, redraw, recolour, or re-typeset the marks.

---

## 1 · The mark family

Five marks, one brand. They are all cut from the same "early-2000s game box-art" cloth: chunky
cream fills, a thick **royal `#0A4C8B`** outline, a hard 3D extrude, and a sunlit
sky→sand→water scene. Pick by **how much room you have** and **how much brand you need to say**.

| Mark | File (master) | What it is | Shape / bg | Reach for it when… |
|---|---|---|---|---|
| **Lockup** (master) | `yaycay-logo-transparent.png` | Diamond scene **+** "Yaycay" wordmark **+** *FOR FAMILIES MAKING MEMORIES* ribbon | Landscape ~1.4:1, transparent | You have space and want the *full* brand statement: marketing headers, heroes, splash, OG/social, email headers, decks. |
| **Wordmark** | `yaycay-wordmark.png` | "Yaycay" bubble lettering only (no badge, no ribbon) | Landscape ~1.44:1, transparent | A tight horizontal bar where the diamond badge would be too busy or too tall; email headers; co-brand strips. |
| **App icon** | `yaycay-app-icon.png` | "Yay!" in a rounded-square (squircle) with palm-island scene | Square 1:1, transparent corners | A **square install/home-screen icon**: PWA install, iOS/Android, app stores, large avatars (≥40px). |
| **Glyph** | `yaycay-glyph.png` | Palm-island diamond **road-sign** badge, **no text** | Square 1:1 (diamond inscribed), transparent | The **smallest** slots: favicons (16–48px), in-app top-bar mark beside a "Yaycay" text label, spinners, tiny watermarks. |
| **Badge** | `yaycay-badge.png` | "Yay!" inside the palm-island diamond | Square 1:1, transparent | Playful spot decoration: kid rewards/stickers, achievement chips, "yay!" celebration moments. |

> The **palm tree** appears only in the icon-family marks (app icon, glyph, badge). The **lockup**
> and **wordmark** are the corporate voice; the **icon family** is the friendly app face.

---

## 2 · Pick-a-mark decision table

| Context / slot | Use | Notes |
|---|---|---|
| Browser favicon (16–48px) | **Glyph** | No text survives at 16px; the palm diamond does. Wired as `app/icon`. |
| PWA install / home-screen / app store (180–512px) | **App icon** | Square, designed for it. Maskable variant keeps "Yay!" in the safe zone. |
| In-app top bar / compact product chrome | **Glyph + "Yaycay" text** | Glyph carries the mark; the text label carries the name. Never the wide lockup here. |
| Marketing site header / nav | **Lockup** (or **Wordmark** on very short bars) | Lockup is the default brand face on the web. |
| Hero / splash / "front door" moment | **Lockup** | The full box-art statement. |
| Social share / Open Graph (1200×630) | **Lockup** on a sky or sunset band | Centre it; leave clear space; add the soft drop shadow. |
| Transactional email header | **Wordmark** or **Lockup** (transparent PNG) | Wordmark is lighter; lockup for welcome / receipts. |
| Sticker / kid reward / celebration | **Badge** | The fun, "yay!" voice. |
| Loading spinner / tiny watermark | **Glyph** | Scales to nothing and stays legible. |

---

## 3 · Rules that keep the marks on-brand

**Clear space.** Keep empty room around every mark equal to **1× the diamond badge** for the
lockup, or **the height of the "Y"** for the wordmark. Nothing crowds the mark.

**Minimum sizes.** Lockup ≥ 120px wide · Wordmark ≥ 88px wide · App icon ≥ 40px ·
Badge ≥ 48px · Glyph ≥ 16px. Below these, step down to a smaller mark (e.g. lockup → glyph).

**Backgrounds.** The marks are built to sit on **cream `#FBF7EC`**, **sky** and **sunset**
gradients, white cards, and warm sunlit photos. The provided drop shadow lifts them off busy
photography. **Do not** place a mark on a flat **royal/navy** field — the royal outline
disappears; use a cream/white surface, the app icon (which carries its own frame), or add a soft
light halo.

**Aspect ratio is fixed.** Never stretch, squish, or force a landscape mark into a square slot
(this is exactly the bug we fixed: the wide lockup was being crammed into 36×36 and 512×512
icon slots — use the **glyph** / **app icon** there instead).

### Never
- Recolour, re-gradient, or flatten the marks. The palette is sampled *from* them.
- Re-typeset "Yaycay" or "Yay!" in another font (Fredoka or otherwise) — always use the asset.
- Rotate, skew, add drop-shadows/glows/strokes/outlines beyond what ships in the file.
- Box the transparent marks inside an extra border or coloured pill.
- Crop the ribbon off the lockup to "make a wordmark" — use `yaycay-wordmark.png`.
- **Reword the tagline.** It is always, exactly, *For families making memories.*

---

## 4 · Web / app icon derivatives (already generated)

Generated from the **app icon** (install) and **glyph** (favicon). Don't hand-roll new ones —
reuse these or regenerate from the masters with the same recipe.

| File | Size | Purpose |
|---|---|---|
| `icon-192.png` | 192² | PWA `purpose: any` |
| `icon-512.png` | 512² | PWA `purpose: any` |
| `maskable-512.png` | 512² | PWA `purpose: maskable` — opaque sky field, "Yay!" inside the ~80% safe zone |
| `apple-touch-icon.png` | 180² | iOS home screen — opaque full-bleed (iOS ignores transparency) |
| `app/icon.png` (FE/Admin) · `app/icon.svg` (Website) | — | Next.js App Router favicon |
| `app/apple-icon.png` | 180² | Next.js App Router Apple touch icon |

**Theme colours** (already set in manifests/metadata): `theme_color`/`themeColor` **`#2A96D8`**
(sky), PWA `background_color` **`#FBF7EC`** (cream).

---

## 5 · Colour quick-reference (sampled from the marks)

`--sky-500 #2A96D8` (primary) · `--royal-500 #0A4C8B` / `--royal-600 #073D72` (the outline ink) ·
`--sun-400 #F7AA15` (CTA / sun / sand) · `--aqua-400 #2BC3D0` (water) · `--cream-100 #FBF7EC`
(paper). Full set: `tokens/colors.css`. Use the CSS variables in product code, never hard-coded
hexes, except for static manifest/`<meta>` values.

---

## 6 · Where the files live in each repo

| Repo | Brand assets | Icon slots wired |
|---|---|---|
| **Yaycay-FE** (PWA) | `public/icons/` — `yaycay-glyph`, `yaycay-wordmark`, `yaycay-app-icon`, `icon-192`, `icon-512`, `maskable-512`, `yaycay-logo` (lockup) | `app/icon.png` (glyph), `app/apple-icon.png`, `app/manifest.ts` (192/512/maskable), `AppShell` top bar (glyph) |
| **Yaycay-Website** (funnel) | `public/brand/` — `yaycay-logo` (lockup), `yaycay-wordmark`, `yaycay-app-icon`, `yaycay-glyph`, `yaycay-badge` | `app/icon.svg` (vector favicon), `app/apple-icon.png`; `components/ui/Logo.tsx` renders the lockup |
| **Yaycay-Admin** (ops) | `public/brand/` — `yaycay-wordmark`, `yaycay-app-icon`, `yaycay-glyph` | `src/app/icon.png` (glyph), `src/app/apple-icon.png` |
| **Yaycay-BE** (API) | `assets/brand/` — `yaycay-lockup`, `yaycay-wordmark`, `yaycay-app-icon`, `yaycay-glyph` | none (serve/attach in email + OG when those land) |
| **Design system** (source of truth) | `vendor/yaycay-ds/assets/brand/` — `yaycay-logo-transparent` (lockup), `yaycay-wordmark`, `yaycay-app-icon`, `yaycay-badge`, `yaycay-glyph` | specimen cards in `guidelines/` |

---

## 7 · For agents working in any Yaycay repo (propagation)

1. **Need a logo?** Come here first. Match the slot to §2, respect §3, reuse the file already
   vendored in this repo (§6). Don't paste a new PNG, don't redraw an SVG, don't set the name
   in a font.
2. **New square icon slot** (favicon, avatar, install, notification) → **glyph** (tiny) or
   **app icon** (install). **Never** the lockup.
3. **New full-brand surface** (hero, OG image, email header, ad) → **lockup**; **wordmark** if
   the space is a short horizontal strip.
4. **Adding a mark to a new repo or app?** Copy the needed masters from
   `vendor/yaycay-ds/assets/brand/`, drop this `BRAND-ASSETS.md` beside the repo's entry doc,
   and add a one-line pointer to it from that doc (as FE/Website/Admin/BE do).
5. **Changed an asset?** Update the master in the design system, re-run the derivative recipe
   (§4), and propagate to the consuming repos. The design system is upstream of all of them.
