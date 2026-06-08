# Yaycay marketing site — UI kit

A full **Yaycay** landing page: the box-art brand turned into a conversion-focused marketing surface.

## Run it
Open `index.html`. It composes the design-system components with the kit's section code.

## Sections & flow
- **Nav** — logo, links, log-in, sunshine **"Get started"** CTA (opens the signup sheet).
- **Hero** (`Hero.jsx`) — the signature **box-art headline** ("Plan the trip. Keep the yay."),
  sub-copy, dual CTAs, a social-proof avatar row, and a cluster of **floating trip cards** over a
  sky-to-sunset scene.
- **How it works** (`Sections.jsx`) — three numbered steps with glossy icon tiles.
- **Destinations** — a four-up grid of scene cards (Sun & sand / Outdoors / City / Theme parks).
- **Testimonial** — five-star family quote.
- **CTA band** + **footer** — final box-art call-to-action and a royal footer.
- **Signup sheet** — "Get started" opens a free-account modal; completing it fires a welcome toast.

## Files
- `index.html` — composed, runnable page (built from the sources below).
- `shared.jsx` — brand **Scene** tiles + inline **Icon** set (shared with the app kit).
- `Hero.jsx` — nav, hero, floating card cluster.
- `Sections.jsx` — how-it-works, destinations, testimonial, CTA band, footer.

## Notes
- All imagery uses brand **Scene** gradient tiles — swap in warm, sunny photography to finish.
- Headlines use the `-webkit-text-stroke` + layered `text-shadow` box-art recipe (see
  `guidelines/brand-boxart.html`). Reserve it for hero / CTA moments only.
