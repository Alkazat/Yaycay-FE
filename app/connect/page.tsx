/**
 * `/connect` - the ridiculously-easy connector setup page. Computes the MCP URL
 * from the request origin so it is correct on any host, then hands off to the
 * client UI with its copy buttons and per-assistant instructions.
 */
import { headers } from "next/headers";
import { MCP_PATH } from "@/lib/mcp/config";
import { env } from "@/lib/env";
import { ConnectClient } from "./ConnectClient";

export const metadata = {
  title: "Connect your AI - Yaycay",
};

export default async function ConnectPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const origin = host
    ? `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`
    : env.siteUrl.replace(/\/$/, "");

  return (
    <main style={{ padding: "var(--space-6)" }}>
      <ConnectClient mcpUrl={`${origin}${MCP_PATH}`} />
    </main>
  );
}
