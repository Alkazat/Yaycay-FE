"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccount, createCheckoutSession, updateAccount } from "@/lib/api/account";
import { listTrips } from "@/lib/api/trips";
import { listTransactions } from "@/lib/api/transactions";
import { retentionStatus } from "@/lib/retention";
import { formatHumanDate } from "@/lib/format";
import type { AccountSummary, Tier, TripSummary } from "@/lib/contract-mock/types";
import type { ConnectionView } from "@/lib/mcp/store";
import { AssistantMark, ASSISTANT_LABEL, type AssistantBrand } from "@/components/brand/AssistantMark";
import { Card, CardBody, Button, Badge, Banner, Input } from "@/components/ds";

const TIER_NAME: Record<Tier, string> = {
  free: "Free demo",
  byo: "Holiday - BYO-AI",
  ours: "Holiday - full",
};

const TIER_BLURB: Record<Tier, string> = {
  ours: "Planning chat on our AI, every day unlocked, journal and photos, and offline.",
  byo: "Bring your own AI, every day unlocked, journal and photos, and offline.",
  free: "The free demo. Buy a holiday to unlock the full adventure.",
};

const BRANDS: AssistantBrand[] = ["claude", "openai", "gemini"];

/* ------------------------------------------------------------------ */
/* Connected assistants hero                                          */
/* ------------------------------------------------------------------ */

async function fetchConnections(): Promise<ConnectionView[]> {
  const res = await fetch("/api/mcp/connections");
  if (!res.ok) return [];
  return ((await res.json()) as { connections: ConnectionView[] }).connections;
}

function ConnectedAssistantsHero() {
  const { data } = useQuery({ queryKey: ["mcp-connections"], queryFn: fetchConnections });
  const connections = data ?? [];
  const active = connections.filter((c) => c.status === "active");

  return (
    <Card>
      <CardBody title="Connected assistants">
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Plan trips with your own AI. Connect ChatGPT, Claude or Gemini and it talks to Yaycay
          through a secure connector.
        </p>

        <div style={{ display: "flex", gap: "var(--space-4)", margin: "var(--space-4) 0", flexWrap: "wrap" }}>
          {BRANDS.map((b) => (
            <div key={b} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <AssistantMark brand={b} size={40} />
              <span style={{ fontWeight: 800, fontSize: "var(--fs-sm)" }}>{ASSISTANT_LABEL[b]}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <a href="/connect">
            <Button variant="cta" size="sm">
              Connect your AI
            </Button>
          </a>
          <a href="/account/connections">
            <Button variant="secondary" size="sm">
              Manage
            </Button>
          </a>
        </div>

        <div style={{ marginTop: "var(--space-3)" }}>
          {active.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
              No assistants connected yet.
            </p>
          ) : (
            <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
              {active.map((c) => (
                <div key={c.connection_id} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Badge tone="meadow" dot>
                    Active
                  </Badge>
                  <strong>{c.client_name}</strong>
                  {c.scopes.includes("yaycay.plan") ? <Badge tone="sun">Can write</Badge> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Settings panel                                                     */
/* ------------------------------------------------------------------ */

/** Edit / clear the recovery email (`PATCH /account`). */
function RecoveryEmailEditor({ current }: { current: string | null }) {
  const qc = useQueryClient();
  const [value, setValue] = useState(current ?? "");
  const save = useMutation({
    mutationFn: (secondary_email: string | null) => updateAccount({ secondary_email }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account"] }),
  });
  const trimmed = value.trim();
  const dirty = trimmed !== (current ?? "");

  return (
    <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
      <Input
        label="Recovery email"
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="you@example.com"
      />
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <Button variant="primary" size="sm" onClick={() => save.mutate(trimmed || null)} disabled={save.isPending || !dirty}>
          {save.isPending ? "Saving..." : "Save"}
        </Button>
        {current ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setValue("");
              save.mutate(null);
            }}
            disabled={save.isPending}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {save.isError ? (
        <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
          Couldn&apos;t save that. Check the address and try again.
        </p>
      ) : null}
      {save.isSuccess && !dirty ? (
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>Saved.</p>
      ) : null}
    </div>
  );
}

function SettingsPanel({ account }: { account: AccountSummary }) {
  return (
    <Card>
      <CardBody title="Settings">
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
          <Badge tone="sky">{TIER_NAME[account.tier]}</Badge>
          <Badge tone={account.two_factor_enrolled ? "meadow" : "soft"}>
            {account.two_factor_enrolled ? "2FA on" : "2FA off"}
          </Badge>
        </div>
        <p style={{ margin: "var(--space-2) 0 0" }}>{TIER_BLURB[account.tier]}</p>

        <div style={{ marginTop: "var(--space-3)" }}>
          <p style={{ margin: 0 }}>
            <strong>Email:</strong> {account.email}
          </p>
          <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
            Member since {formatHumanDate(account.created_at)}
          </p>
        </div>

        <div style={{ marginTop: "var(--space-3)" }}>
          <RecoveryEmailEditor current={account.secondary_email ?? null} />
        </div>
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Transaction history                                                */
/* ------------------------------------------------------------------ */

const TXN_TONE = { paid: "meadow", refunded: "ink", pending: "sun" } as const;

function TransactionHistory() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions"],
    queryFn: ({ signal }) => listTransactions(signal),
  });

  return (
    <Card>
      <CardBody title="Transaction history">
        {isLoading ? <p style={{ margin: 0 }}>Loading...</p> : null}
        {isError ? <Banner tone="danger">We couldn&rsquo;t load your transactions.</Banner> : null}
        {data && data.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>No transactions yet.</p>
        ) : null}
        {data && data.length > 0 ? (
          <div className="yc-stack" style={{ gap: "var(--space-3)" }}>
            {data.map((t) => (
              <div
                key={t.id}
                style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}
              >
                <div>
                  <strong>{t.description}</strong>
                  <div style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                    {formatHumanDate(t.date)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ fontWeight: 800 }}>US${t.amount_usd}</span>
                  <Badge tone={TXN_TONE[t.status]}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Retention (your data)                                              */
/* ------------------------------------------------------------------ */

function RetentionRow({
  trip,
  onKeep,
  keeping,
}: {
  trip: TripSummary;
  onKeep: (trip: TripSummary) => void;
  keeping: boolean;
}) {
  const status = retentionStatus(trip.retention_expires_at, trip.data_kept);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}>
      <div>
        <strong>{trip.destination}</strong>
        <div style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
          {status.kept ? (
            <Badge tone="meadow">Memories kept</Badge>
          ) : status.expired ? (
            <Badge tone="coral">Scheduled for deletion</Badge>
          ) : (
            `Kept until ${formatHumanDate(trip.retention_expires_at!)} (${status.daysLeft} days)`
          )}
        </div>
      </div>
      {!status.kept ? (
        <Button variant="cta" size="sm" onClick={() => onKeep(trip)} disabled={keeping}>
          {keeping ? "Opening..." : "Keep my memories"}
        </Button>
      ) : null}
    </div>
  );
}

export function AccountClient() {
  const accountQuery = useQuery({ queryKey: ["account"], queryFn: ({ signal }) => getAccount(signal) });
  const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: ({ signal }) => listTrips(signal) });

  const checkout = useMutation({
    mutationFn: (trip: TripSummary) =>
      createCheckoutSession({ price_id: "price_datakeep_annual", trip_id: trip.id }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const account = accountQuery.data;
  const trips = tripsQuery.data ?? [];
  const anyAtRisk = trips.some((t) => !retentionStatus(t.retention_expires_at, t.data_kept).kept);

  return (
    <div className="yc-stack" data-testid="account">
      <header>
        <h1 style={{ margin: 0 }}>Account</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Your assistants, plan, memories and settings.
        </p>
      </header>

      {accountQuery.isLoading ? <p>Loading your account...</p> : null}

      <div className="yc-grid-5050">
        <ConnectedAssistantsHero />
        {account ? <SettingsPanel account={account} /> : null}
      </div>

      <Card>
        <CardBody title="Your data">
          {anyAtRisk ? (
            <Banner tone="warning" title="Keep your memories">
              Trip data is kept for 12 months after the holiday. Add a keep-token to hold onto it.
            </Banner>
          ) : null}
          {trips.length === 0 ? (
            <p style={{ margin: 0 }}>No trips yet.</p>
          ) : (
            <div className="yc-stack" style={{ gap: "var(--space-4)" }}>
              {trips.map((t) => (
                <RetentionRow key={t.id} trip={t} onKeep={(trip) => checkout.mutate(trip)} keeping={checkout.isPending} />
              ))}
            </div>
          )}
          {checkout.isError ? (
            <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
              Hmm, we couldn&apos;t open checkout. Give it another go?
            </p>
          ) : null}
        </CardBody>
      </Card>

      <TransactionHistory />
    </div>
  );
}
