/**
 * Lightweight inline brand marks for the supported AI assistants. Recognisable
 * approximations (terracotta burst, sparkle, knot) so the "Connected assistants"
 * hero reads as branded without bundling external logo files. Each is isolated,
 * so an official SVG can be dropped in per assistant later.
 */

export type AssistantBrand = "claude" | "openai" | "gemini";

/** Product name per brand (the model the user talks to). */
export const ASSISTANT_LABEL: Record<AssistantBrand, string> = {
  claude: "Claude",
  openai: "ChatGPT",
  gemini: "Gemini",
};

/** The company behind each model, for "Owner Model" pills (e.g. "Anthropic Claude"). */
export const ASSISTANT_OWNER: Record<AssistantBrand, string> = {
  claude: "Anthropic",
  openai: "OpenAI",
  gemini: "Google",
};

/**
 * A branded pill: the assistant's logo mark plus "Owner Model" (e.g. the
 * Anthropic burst + "Anthropic Claude"). Used on the connect/how-to page so each
 * assistant reads by its logo and its maker, not a repeated bare word.
 */
export function BrandPill({ brand, size = 22 }: { brand: AssistantBrand; size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 12px 5px 8px",
        borderRadius: "var(--radius-pill, 999px)",
        background: "var(--surface-sunk)",
        border: "2px solid var(--sand-200, #e7e2d8)",
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      <AssistantMark brand={brand} size={size} />
      <span>
        <span style={{ color: "var(--text-muted)" }}>{ASSISTANT_OWNER[brand]}</span>{" "}
        {ASSISTANT_LABEL[brand]}
      </span>
    </span>
  );
}

/** Infer a partner brand from a dynamically-registered assistant's name. */
export function brandFromName(name: string | null | undefined): AssistantBrand | null {
  const n = (name ?? "").toLowerCase();
  if (n.includes("claude") || n.includes("anthropic")) return "claude";
  if (n.includes("gemini") || n.includes("google")) return "gemini";
  if (n.includes("chatgpt") || n.includes("openai") || n.includes("codex") || n.includes("gpt")) {
    return "openai";
  }
  return null;
}

function ClaudeMark({ size }: { size: number }) {
  // Anthropic-style radial burst.
  const rays = Array.from({ length: 12 });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="#CC785C">
        {rays.map((_, i) => (
          <rect
            key={i}
            x="11.1"
            y="2.4"
            width="1.8"
            height="7.2"
            rx="0.9"
            transform={`rotate(${i * 30} 12 12)`}
          />
        ))}
      </g>
    </svg>
  );
}

function GeminiMark({ size }: { size: number }) {
  // Four-point sparkle with the Gemini blue/violet gradient.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="yc-gemini-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="55%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.5c.9 6 3.6 8.7 9.6 9.6c-6 .9-8.7 3.6-9.6 9.6c-.9-6-3.6-8.7-9.6-9.6c6-.9 8.7-3.6 9.6-9.6Z"
        fill="url(#yc-gemini-grad)"
      />
    </svg>
  );
}

function OpenAiMark({ size }: { size: number }) {
  // Simplified hexafoil knot.
  const petals = Array.from({ length: 3 });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="#0F0F0F" strokeWidth="1.6">
        {petals.map((_, i) => (
          <rect
            key={i}
            x="5.5"
            y="9.2"
            width="13"
            height="5.6"
            rx="2.8"
            transform={`rotate(${i * 60} 12 12)`}
          />
        ))}
      </g>
    </svg>
  );
}

/** A single assistant brand mark. */
export function AssistantMark({ brand, size = 28 }: { brand: AssistantBrand; size?: number }) {
  if (brand === "claude") return <ClaudeMark size={size} />;
  if (brand === "gemini") return <GeminiMark size={size} />;
  return <OpenAiMark size={size} />;
}
