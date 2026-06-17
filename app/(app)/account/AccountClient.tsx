"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAccount,
  createCheckoutSession,
  updateAccount,
  type AccountProfile,
} from "@/lib/api/account";
import { listTrips, archiveTrip, duplicateTrip } from "@/lib/api/trips";
import { listTransactions } from "@/lib/api/transactions";
import { retentionStatus } from "@/lib/retention";
import { formatHumanDate } from "@/lib/format";
import type { Tier, TripSummary } from "@/lib/contract-mock/types";
import type { ConnectionView } from "@/lib/mcp/store";
import {
  AssistantMark,
  ASSISTANT_LABEL,
  brandFromName,
  type AssistantBrand,
} from "@/components/brand/AssistantMark";
import { ShareTripModal } from "@/components/trips/ShareTripModal";
import { Card, CardBody, Button, Badge, Banner, Input } from "@/components/ds";

/** US dollars, no fake precision: whole dollars unless cents are present. */
function formatUsd(amount: number): string {
  return `US$${amount.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

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
      <CardBody title="Connect your assistant">
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

        {/* Connected assistants: one row each, with the partner logo. */}
        <div style={{ marginTop: "var(--space-4)" }}>
          <span style={{ fontWeight: 800, display: "block", marginBottom: "var(--space-2)" }}>
            Connected assistants
          </span>
          {active.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
              None yet - connect one above.
            </p>
          ) : (
            <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
              {active.map((c) => {
                const brand = brandFromName(c.client_name);
                return (
                  <div
                    key={c.connection_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "var(--space-2) var(--space-3)",
                      borderRadius: "var(--radius-md, 12px)",
                      border: "2px solid var(--sand-200, #e7e2d8)",
                      background: "var(--surface, #fff)",
                    }}
                  >
                    <span style={{ width: 32, display: "grid", placeItems: "center", flex: "none" }}>
                      {brand ? (
                        <AssistantMark brand={brand} size={28} />
                      ) : (
                        <Badge tone="meadow" dot>
                          AI
                        </Badge>
                      )}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: "block" }}>{c.client_name}</strong>
                      <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
                        {c.last_used_at
                          ? `Last used ${new Date(c.last_used_at).toLocaleDateString()}`
                          : "Not used yet"}
                      </span>
                    </span>
                    <Badge tone="meadow" dot>
                      Active
                    </Badge>
                    {c.scopes.includes("yaycay.plan") ? <Badge tone="sun">Can write</Badge> : null}
                  </div>
                );
              })}
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

/**
 * Editable profile fields (`PATCH /account`): display name + recovery email.
 * Login email is server-owned (changed via the auth flow), so it is shown
 * read-only. Save is enabled only when something actually changed.
 */
function ProfileForm({ account }: { account: AccountProfile }) {
  const qc = useQueryClient();
  const [name, setName] = useState(account.name ?? "");
  const [recovery, setRecovery] = useState(account.secondary_email ?? "");

  const save = useMutation({
    mutationFn: () =>
      updateAccount({
        name: name.trim() || null,
        secondary_email: recovery.trim() || null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["account"] }),
  });

  const dirty =
    name.trim() !== (account.name ?? "") || recovery.trim() !== (account.secondary_email ?? "");

  return (
    <div className="yc-stack" data-testid="profile-form" style={{ gap: "var(--space-3)" }}>
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. The Yeates Family"
      />
      <Input
        label="Recovery email"
        type="email"
        value={recovery}
        onChange={(e) => setRecovery(e.target.value)}
        placeholder="you@example.com"
      />
      <div>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
          Login email
        </p>
        <p style={{ margin: "2px 0 0" }}>
          <strong>{account.email}</strong>{" "}
          <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
            (change via sign-in)
          </span>
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <Button variant="primary" size="sm" onClick={() => save.mutate()} disabled={save.isPending || !dirty}>
          {save.isPending ? "Saving..." : "Save changes"}
        </Button>
        {save.isError ? (
          <span style={{ color: "var(--coral-500)", fontWeight: 700 }}>
            Couldn&apos;t save that. Check the details and try again.
          </span>
        ) : null}
        {save.isSuccess && !dirty ? (
          <span style={{ color: "var(--meadow-600, #2f8a4e)", fontWeight: 800 }}>✓ Saved</span>
        ) : null}
      </div>
    </div>
  );
}

function SettingsPanel({ account }: { account: AccountProfile }) {
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
        <p style={{ margin: "var(--space-1) 0 var(--space-3)", color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
          Member since {formatHumanDate(account.created_at)}
        </p>

        <ProfileForm account={account} />
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Transaction history                                                */
/* ------------------------------------------------------------------ */

const TXN_TONE = { paid: "meadow", refunded: "ink", pending: "sun" } as const;

const TH_STYLE: React.CSSProperties = {
  textAlign: "left",
  padding: "var(--space-2) var(--space-3)",
  color: "var(--text-muted)",
  fontWeight: 800,
  fontSize: "var(--fs-sm)",
  borderBottom: "2px solid var(--sand-200)",
  whiteSpace: "nowrap",
};
const TD_STYLE: React.CSSProperties = {
  padding: "var(--space-3)",
  borderBottom: "1px solid var(--sand-200)",
  verticalAlign: "top",
};

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
          <div style={{ overflowX: "auto" }}>
            <table data-testid="transactions-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH_STYLE}>Date</th>
                  <th style={TH_STYLE}>Description</th>
                  <th style={TH_STYLE}>Trip</th>
                  <th style={{ ...TH_STYLE, textAlign: "right" }}>Amount</th>
                  <th style={TH_STYLE}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t.id}>
                    <td style={{ ...TD_STYLE, whiteSpace: "nowrap" }}>{formatHumanDate(t.date)}</td>
                    <td style={{ ...TD_STYLE, fontWeight: 700 }}>{t.description}</td>
                    <td style={TD_STYLE}>
                      {t.trip_id ? (
                        <a href={`/trips/${t.trip_id}`} style={{ fontWeight: 700 }}>
                          {t.trip_name ?? "View trip"}
                        </a>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>—</span>
                      )}
                    </td>
                    <td style={{ ...TD_STYLE, textAlign: "right", fontWeight: 800, whiteSpace: "nowrap" }}>
                      {formatUsd(t.amount_usd)}
                    </td>
                    <td style={TD_STYLE}>
                      <Badge tone={TXN_TONE[t.status]}>{t.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Retention (your data)                                              */
/* ------------------------------------------------------------------ */

/**
 * One row of the "Your data" table: the trip, its retention status, and the same
 * Share / Duplicate / Archive actions the trip tiles carry. Archive never deletes
 * - it moves the trip into the Archive list, from where it can be restored.
 */
function DataRow({
  trip,
  onKeep,
  keeping,
}: {
  trip: TripSummary;
  onKeep: (trip: TripSummary) => void;
  keeping: boolean;
}) {
  const qc = useQueryClient();
  const [sharing, setSharing] = useState(false);
  const status = retentionStatus(trip.retention_expires_at, trip.data_kept);
  const archived = trip.status === "archived";
  const invalidate = () => qc.invalidateQueries({ queryKey: ["trips"] });

  const archive = useMutation({ mutationFn: () => archiveTrip(trip.id, !archived), onSuccess: invalidate });
  const duplicate = useMutation({ mutationFn: () => duplicateTrip(trip.id), onSuccess: invalidate });
  const busy = archive.isPending || duplicate.isPending;

  return (
    <tr data-testid="data-row">
      <td style={{ ...TD_STYLE, fontWeight: 700 }}>
        {trip.destination}
        {archived ? (
          <span style={{ marginLeft: "var(--space-2)" }}>
            <Badge tone="soft">Archived</Badge>
          </span>
        ) : null}
      </td>
      <td style={TD_STYLE}>
        {status.kept ? (
          <Badge tone="meadow">Memories kept</Badge>
        ) : status.expired ? (
          <Badge tone="coral">Scheduled for deletion</Badge>
        ) : (
          <div className="yc-stack" style={{ gap: 4 }}>
            <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
              Kept until {formatHumanDate(trip.retention_expires_at!)} ({status.daysLeft} days)
            </span>
            <Button variant="ghost" size="sm" onClick={() => onKeep(trip)} disabled={keeping}>
              {keeping ? "Opening..." : "Keep my memories"}
            </Button>
          </div>
        )}
      </td>
      <td style={{ ...TD_STYLE, whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Button variant="secondary" size="sm" onClick={() => setSharing(true)}>
            Share
          </Button>
          <Button variant="secondary" size="sm" onClick={() => duplicate.mutate()} disabled={busy}>
            {duplicate.isPending ? "..." : "Copy"}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => archive.mutate()} disabled={busy}>
            {archive.isPending ? "..." : archived ? "Restore" : "Archive"}
          </Button>
        </div>
        {sharing ? <ShareTripModal trip={trip} onClose={() => setSharing(false)} /> : null}
      </td>
    </tr>
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
            <div style={{ overflowX: "auto" }}>
              <table data-testid="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>Trip</th>
                    <th style={TH_STYLE}>Data</th>
                    <th style={TH_STYLE}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <DataRow key={t.id} trip={t} onKeep={(trip) => checkout.mutate(trip)} keeping={checkout.isPending} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {checkout.isError ? (
            <p style={{ margin: "var(--space-3) 0 0", color: "var(--coral-500)", fontWeight: 700 }}>
              Hmm, we couldn&apos;t open checkout. Give it another go?
            </p>
          ) : null}
        </CardBody>
      </Card>

      <TransactionHistory />
    </div>
  );
}
