# Partner assistant logos

Drop the official assistant logos here and the app will use them in place of the
built-in inline marks (`components/brand/AssistantMark.tsx`).

Expected files (exact names — case-sensitive):

| Brand            | Icon (square)        | Wordmark (optional)        |
| ---------------- | -------------------- | -------------------------- |
| OpenAI / ChatGPT | `chatgpt.svg`        | `chatgpt-wordmark.svg`     |
| Anthropic Claude | `claude.svg`         | `claude-wordmark.svg`      |
| Google Gemini    | `gemini.svg`         | `gemini-wordmark.svg`      |

Notes:
- **SVG preferred** (crisp at any size). PNG also works — use the same names with
  a `.png` extension and tell me, and I'll point the component at the PNGs.
- The **icon (square)** version is what the small "Owner Model" pills and connect
  cards use. If you only have the full wordmark, upload it as the `*-wordmark`
  file and I'll place it where there's room (e.g. the connect cards) and keep the
  square icon for the pills.
- Until these exist, the app falls back to the inline marks, so nothing breaks.
