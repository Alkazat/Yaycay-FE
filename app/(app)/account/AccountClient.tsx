"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccount, createCheckoutSession, updateAccount } from "@/lib/api/account";
import { listTrips } from "@/lib/api/trips";
import { retentionStatus } from "@/lib/retention";
import { formatHumanDate } from "@/lib/format";
import type { Tier, TripSummary } from "@/lib/contract-mock/types";
import { Card, CardBody, Button, Badge, Banner, Input } from "@/components/ds";

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
        <Button
          variant="primary"
          size="sm"
          onClick={() => save.mutate(trimmed || null)}
          disabled={save.isPending || !dirty}
        >
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

const TIER_NAME: Record<Tier, string> = {
  free: "Free demo",
  byo: "Holiday - BYO-AI",
  ours: "Holiday - full",
};

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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        flexWrap: "wrap",
      }}
    >
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
      createCheckoutSession({
        price_id: "price_datakeep_annual",
        trip_id: trip.id,
      }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const account = accountQuery.data;
  const trips = tripsQuery.data ?? [];
  const anyAtRisk = trips.some(
    (t) => !retentionStatus(t.retention_expires_at, t.data_kept).kept,
  );

  return (
    <div className="yc-stack" data-testid="account">
      <header>
        <h1>Account</h1>
        <p style={{ color: "var(--text-muted)", fontWeight: 700 }}>
          Your plan, your memories, your settings.
        </p>
      </header>

      {accountQuery.isLoading ? <p>Loading your account...</p> : null}

      {account ? (
        <Card>
          <CardBody title="Your plan">
            <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
              <Badge tone="sky">{TIER_NAME[account.tier]}</Badge>
            </div>
            <p style={{ margin: 0 }}>
              {account.tier === "ours"
                ? "Planning chat on our AI, every day unlocked, journal and photos, and offline."
                : account.tier === "byo"
                  ? "Bring your own AI, every day unlocked, journal and photos, and offline."
                  : "The free demo. Buy a holiday to unlock the full adventure."}
            </p>
          </CardBody>
        </Card>
      ) : null}

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
                <RetentionRow
                  key={t.id}
                  trip={t}
                  onKeep={(trip) => checkout.mutate(trip)}
                  keeping={checkout.isPending}
                />
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

      {account ? (
        <Card>
          <CardBody title="Settings">
            <p style={{ margin: 0 }}>
              <strong>Email:</strong> {account.email}
            </p>
            <RecoveryEmailEditor current={account.secondary_email ?? null} />
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardBody title="Connected assistants">
          <p style={{ margin: 0 }}>
            Manage the AI assistants connected to your account, or connect a new one.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
            <a href="/account/connections">
              <Button variant="secondary" size="sm">
                Manage assistants
              </Button>
            </a>
            <a href="/connect">
              <Button variant="primary" size="sm">
                Connect your AI
              </Button>
            </a>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
