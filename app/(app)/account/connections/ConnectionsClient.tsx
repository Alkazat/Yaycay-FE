"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardBody, Badge, Button, Banner } from "@/components/ds";

interface ConnectionView {
  connection_id: string;
  client_name: string;
  scopes: string[];
  status: "active" | "revoked";
  created_at: number;
  last_used_at: number | null;
}

async function fetchConnections(): Promise<ConnectionView[]> {
  const res = await fetch("/api/mcp/connections");
  if (!res.ok) throw new Error("Could not load your connected assistants.");
  return ((await res.json()) as { connections: ConnectionView[] }).connections;
}

async function revoke(connectionId: string): Promise<void> {
  const res = await fetch("/api/mcp/connections/revoke", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ connection_id: connectionId }),
  });
  if (!res.ok) throw new Error("Could not revoke that assistant.");
}

function when(ms: number | null): string {
  if (!ms) return "never";
  return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function ConnectionRow({ c }: { c: ConnectionView }) {
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const m = useMutation({
    mutationFn: () => revoke(c.connection_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mcp-connections"] }),
  });
  const canWrite = c.scopes.includes("yaycay.plan");

  return (
    <Card>
      <CardBody title={c.client_name}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" }}>
          {c.status === "active" ? (
            <Badge tone="meadow" dot>
              Active
            </Badge>
          ) : (
            <Badge tone="coral" dot>
              Revoked
            </Badge>
          )}
          <Badge tone="sky">Can read</Badge>
          {canWrite ? <Badge tone="sun">Can write</Badge> : null}
        </div>
        <p style={{ margin: "var(--space-3) 0 0", color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
          Connected {when(c.created_at)} - last used {when(c.last_used_at)}
        </p>
        {c.status === "active" ? (
          <div style={{ marginTop: "var(--space-3)" }}>
            {confirming ? (
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700 }}>Disconnect this assistant?</span>
                <Button variant="danger" size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
                  {m.isPending ? "Revoking..." : "Yes, disconnect"}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} disabled={m.isPending}>
                  Keep
                </Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setConfirming(true)}>
                Disconnect
              </Button>
            )}
            {m.isError ? (
              <p style={{ margin: "var(--space-2) 0 0", color: "var(--coral-500)", fontWeight: 700 }}>
                {(m.error as Error).message}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function ConnectionsClient() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mcp-connections"],
    queryFn: fetchConnections,
  });

  return (
    <div className="yc-stack" style={{ gap: "var(--space-4)", maxWidth: 640 }}>
      <header className="yc-stack" style={{ gap: "var(--space-2)" }}>
        <h1 style={{ margin: 0 }}>Connected assistants</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          AI assistants you have connected to your Yaycay account. Disconnect any one to cut its
          access immediately.
        </p>
      </header>

      {isLoading ? <p>Loading your connected assistants...</p> : null}
      {isError ? <Banner tone="danger">We could not load your connected assistants.</Banner> : null}

      {data && data.length === 0 ? (
        <Card variant="soft">
          <CardBody>
            <p style={{ margin: 0 }}>
              No assistants connected yet.{" "}
              <a href="/connect" style={{ fontWeight: 800 }}>
                Connect your AI
              </a>{" "}
              to plan trips from ChatGPT, Claude or Gemini.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {data?.map((c) => (
        <ConnectionRow key={c.connection_id} c={c} />
      ))}
    </div>
  );
}
