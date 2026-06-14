"use client";

import { useQuery } from "@tanstack/react-query";
import { listTrips } from "@/lib/api/trips";
import { entitlementsFor } from "@/lib/entitlements";
import type { Tier } from "@/lib/contract-mock/types";
import { PlanChat } from "@/components/chat/PlanChat";
import { Button, Card, CardBody, Badge, Banner } from "@/components/ds";

/** BYO-AI connector entry point. The connect flow lives at /connect. */
function ByoConnector() {
  return (
    <Card>
      <CardBody title="Bring your own AI">
        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <Badge tone="meadow" dot>
            Ready to connect
          </Badge>
        </div>
        <p style={{ margin: 0 }}>
          Connect your own ChatGPT, Claude or Gemini to plan this trip. Your AI talks to Yaycay
          through a secure connector - we never see your subscription.
        </p>
        <ol style={{ margin: 0, paddingLeft: "var(--space-5)", color: "var(--text-body)" }}>
          <li>Open the connect page and pick your assistant.</li>
          <li>Paste the Yaycay MCP URL into its connector settings.</li>
          <li>Sign in once and approve - then plan right from your assistant.</li>
        </ol>
        <a href="/connect">
          <Button variant="primary">Connect your AI</Button>
        </a>
      </CardBody>
    </Card>
  );
}

export function PlanClient({ tripId }: { tripId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trips"],
    queryFn: ({ signal }) => listTrips(signal),
  });

  if (isLoading) return <p>Loading the planner...</p>;

  const trip = data?.find((t) => t.id === tripId);
  const tier: Tier = trip?.tier ?? "ours";
  const ent = entitlementsFor(tier);

  return (
    <div className="yc-stack" data-testid="plan">
      <header className="yc-stack" style={{ gap: "var(--space-2)" }}>
        <h1 style={{ margin: 0 }}>Plan {trip ? trip.destination : "your trip"}</h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
          Build the trip your way.
        </p>
      </header>

      {isError ? (
        <Banner tone="danger">We couldn&apos;t load the planner. Give it another go?</Banner>
      ) : null}

      {ent.canUseByoConnector ? <ByoConnector /> : null}
      {ent.canUseOurAi ? <PlanChat tripId={tripId} /> : null}
      {!ent.canUseByoConnector && !ent.canUseOurAi ? (
        <Card variant="soft">
          <CardBody>
            <p style={{ margin: 0 }}>Planning unlocks with a full holiday.</p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
