# Brand assets — Yaycay-FE (Customer PWA)

> **Canonical spec:** `vendor/yaycay-ds/BRAND-ASSETS.md` (the mark family, decision table,
> do/don't, colours). This file is the FE-thread cheat sheet. **For families making memories.**

The design system is the source of truth; this PWA vendors the marks it needs under
`public/icons/` (+ the App-Router icon files in `app/`).

## Which mark, which slot (FE)

| Slot | File | Wired in |
|---|---|---|
| Browser favicon | `app/icon.png` (**glyph**) | App Router auto |
| Apple touch icon | `app/apple-icon.png` | App Router auto |
| PWA install icons (192 / 512 / maskable) | `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` | `app/manifest.ts` |
| In-app top bar mark | `public/icons/yaycay-glyph.png` (36²) | `components/shell/AppShell.tsx` |
| Landing / front-door hero | `public/icons/yaycay-logo.png` (**lockup**) | `app/page.tsx` |
| Anything else | copy from `vendor/yaycay-ds/assets/brand/` | — |

Also available in `public/icons/`: `yaycay-wordmark.png`, `yaycay-app-icon.png`.

## The rules that bite here
- **Square slot ⇒ glyph or app icon. Never the wide lockup.** (The top bar and the PWA install
  icons used to render the wide lockup squished into a square — now fixed; keep it that way.)
- Favicons/spinners/avatars under ~40px → **glyph** (the palm survives; "Yay!" text does not).
- Install / store / home-screen → **app icon** (square "Yay!").
- A genuine full-brand moment (splash, marketing-style hero) → **lockup**.
- `theme_color` `#2A96D8`, `background_color` `#FBF7EC` are already set — don't drift them.
- Never recolour, stretch, re-typeset, or reword the tagline. Pull the file; don't redraw it.
