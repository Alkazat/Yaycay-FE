Chunky, glossy, pressable "box-art" button — the brand's primary action control.

```jsx
import { Button } from "./Button";

<Button variant="cta" size="lg" icon={<PlaneIcon />}>Start a trip</Button>
```

Variants: `primary` (sky), `cta` (sunshine — the main call-to-action), `accent` (aqua),
`danger` (coral), `secondary` (white + royal outline), `ghost` (text-only).
Sizes: `sm` / `md` / `lg`. Use `block` for full-width. Pass icons as nodes via `icon` / `iconRight`.

Rules: one `cta` per view max. Buttons sit on a hard "pop" shadow and push down on press —
don't remove the shadow or the tactility is lost. Label in sentence case ("Start a trip"), never SHOUTING.
