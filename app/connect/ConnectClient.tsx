"use client";

import { useState } from "react";
import { Card, CardBody, Badge, Button } from "@/components/ds";
import { AssistantMark, BrandLogo, ASSISTANT_OWNER, ASSISTANT_LABEL, type AssistantBrand } from "@/components/brand/AssistantMark";

/**
 * One-click-ish connector setup. The MCP URL + OAuth discovery do the heavy
 * lifting (clients self-register and the parent just approves), so each
 * assistant needs at most: open its connector settings, paste this URL, sign in.
 * We give a copy button for the URL plus the exact command / config snippet for
 * the CLI-based tools.
 */

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard blocked; the value is visible to copy manually
        }
      }}
    >
      {copied ? "Copied!" : label}
    </Button>
  );
}

function Snippet({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "stretch" }}>
      <pre
        style={{
          flex: 1,
          margin: 0,
          padding: "var(--space-3)",
          background: "var(--surface-sunken, #f4f4f5)",
          borderRadius: "var(--radius-md, 12px)",
          overflowX: "auto",
          fontSize: "var(--fs-sm)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {text}
      </pre>
      <CopyButton value={text} />
    </div>
  );
}

interface Provider {
  key: string;
  /** The brand behind this client, for the logo + "Owner Model" pill. */
  brand?: AssistantBrand;
  name: string;
  blurb: string;
  /** A deep link to the assistant's connector settings, when one exists. */
  settingsUrl?: string;
  settingsLabel?: string;
  /** Steps shown under the primary action. */
  steps: string[];
  /** Optional CLI command / config snippet for terminal-based tools. */
  snippet?: string;
}

function providers(mcpUrl: string): Provider[] {
  const desktopConfig = JSON.stringify(
    { mcpServers: { yaycay: { type: "http", url: mcpUrl } } },
    null,
    2,
  );
  return [
    {
      key: "claude-chat",
      brand: "claude",
      name: "Claude app",
      blurb: "Add Yaycay as a custom connector in the Claude app.",
      settingsUrl: "https://claude.ai/settings/connectors",
      settingsLabel: "Open Claude connectors",
      steps: [
        "Open Settings then Connectors and choose Add custom connector.",
        "Paste the Yaycay MCP URL below and save.",
        "Click Connect and approve access on the Yaycay screen.",
      ],
    },
    {
      key: "claude-cowork",
      brand: "claude",
      name: "Claude Code / Cowork",
      blurb: "One command in your terminal registers the connector.",
      steps: [
        "Run the command below.",
        "Claude will open the Yaycay sign-in and consent in your browser.",
      ],
      snippet: `claude mcp add --transport http yaycay ${mcpUrl}`,
    },
    {
      key: "chatgpt",
      brand: "openai",
      name: "ChatGPT app",
      blurb: "Add Yaycay under Connectors in ChatGPT settings.",
      settingsUrl: "https://chatgpt.com/#settings/Connectors",
      settingsLabel: "Open ChatGPT connectors",
      steps: [
        "Open Settings then Connectors and choose Add (you may need Developer mode).",
        "Paste the Yaycay MCP URL below.",
        "Sign in and approve access on the Yaycay screen.",
      ],
    },
    {
      key: "codex",
      brand: "openai",
      name: "Codex",
      blurb: "Add Yaycay to your Codex config.",
      steps: ["Add this to ~/.codex/config.toml, then restart Codex and authorize."],
      snippet: `[mcp_servers.yaycay]\nurl = "${mcpUrl}"`,
    },
    {
      key: "gemini",
      brand: "gemini",
      name: "Gemini CLI",
      blurb: "Add Yaycay to the Gemini CLI.",
      steps: ["Run the command below, then authorize in your browser."],
      snippet: `gemini mcp add yaycay ${mcpUrl} --transport http`,
    },
    {
      key: "generic",
      name: "Any other MCP client",
      blurb: "Most desktop assistants accept this mcpServers config.",
      steps: ["Paste this into the client's MCP config file."],
      snippet: desktopConfig,
    },
  ];
}

export function ConnectClient({ mcpUrl }: { mcpUrl: string }) {
  const list = providers(mcpUrl);
  return (
    <div className="yc-stack" style={{ gap: "var(--space-5)", maxWidth: 720, margin: "0 auto" }}>
      <header className="yc-stack" style={{ gap: "var(--space-2)" }}>
        <h1 style={{ margin: 0 }}>Connect your AI to Yaycay</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Plan trips with your own ChatGPT, Claude or Gemini. Your assistant talks to Yaycay through
          a secure connector and you approve access. We never see your AI subscription.
        </p>
        <p style={{ margin: 0 }}>
          <a href="/account/connections" style={{ fontWeight: 800 }}>
            Manage connected assistants
          </a>
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--space-5)",
            marginTop: "var(--space-2)",
          }}
        >
          <BrandLogo brand="claude" height={26} />
          <BrandLogo brand="openai" height={26} />
          <BrandLogo brand="gemini" height={26} />
        </div>
      </header>

      <Card>
        <CardBody title="Your Yaycay MCP URL">
          <p style={{ margin: 0, color: "var(--text-body)" }}>
            This is all most assistants need. Paste it into your assistant&apos;s connector settings.
          </p>
          <div style={{ marginTop: "var(--space-3)" }}>
            <Snippet text={mcpUrl} />
          </div>
          <p style={{ margin: "var(--space-3) 0 0", fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>
            On first connect you sign in to Yaycay once and approve what the assistant can do. No
            tokens to copy.
          </p>
        </CardBody>
      </Card>

      {list.map((p) => (
        <Card key={p.key}>
          <CardBody>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
              {p.brand ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md, 12px)",
                    background: "var(--surface-sunk)",
                    border: "2px solid var(--sand-200, #e7e2d8)",
                    flex: "none",
                  }}
                >
                  <AssistantMark brand={p.brand} size={26} />
                </span>
              ) : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: "block", fontSize: "var(--fs-h5, 1.1rem)" }}>{p.name}</strong>
                {p.brand ? (
                  <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                    {ASSISTANT_OWNER[p.brand]} {ASSISTANT_LABEL[p.brand]}
                  </span>
                ) : null}
              </div>
              <Badge tone="meadow">MCP</Badge>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>{p.blurb}</p>
            <ol style={{ margin: "var(--space-3) 0 0", paddingLeft: "var(--space-5)", color: "var(--text-body)" }}>
              {p.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
              {p.settingsUrl ? (
                <a href={p.settingsUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="sm">
                    {p.settingsLabel ?? "Open settings"}
                  </Button>
                </a>
              ) : null}
              {!p.snippet ? <CopyButton value={mcpUrl} label="Copy MCP URL" /> : null}
            </div>
            {p.snippet ? (
              <div style={{ marginTop: "var(--space-3)" }}>
                <Snippet text={p.snippet} />
              </div>
            ) : null}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
