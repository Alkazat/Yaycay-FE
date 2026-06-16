"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listTrips } from "@/lib/api/trips";
import { entitlementsFor } from "@/lib/entitlements";
import { PRODUCTS, type Product } from "@/lib/paywall";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { Modal } from "@/components/ui/Modal";
import type { Tier } from "@/lib/contract-mock/types";
import { PlanChat } from "@/components/chat/PlanChat";
import { ChatHistoryPanel } from "@/components/chat/ChatHistoryPanel";
import { Button, Card, CardBody, Banner } from "@/components/ds";

/**
 * Plan upgrade/downgrade matrix:
 * - free  -> unlock planning (paywall: our AI / BYO)
 * - byo   -> upgrade to our AI (paywall)
 * - ours  -> "use your own AI too" (downgrade is informational: no refunds, both
 *            tiers stay usable, here is the connection guide)
 */
function PlanUpgrade({ tier, tripId }: { tier: Tier; tripId: string }) {
  const [pay, setPay] = useState<Product | null>(null);
  const [downgrade, setDowngrade] = useState(false);

  if (tier === "free") {
    return (
      <Card variant="soft">
        <CardBody title="Unlock planning">
          <p style={{ margin: 0 }}>Planning unlocks with a full holiday. Pick how you&rsquo;d like to plan:</p>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)", flexWrap: "wrap" }}>
            <Button variant="cta" onClick={() => setPay(PRODUCTS.ours)}>
              Our AI - US$129
            </Button>
            <Button variant="secondary" onClick={() => setPay(PRODUCTS.byo)}>
              Bring your own - US$59
            </Button>
          </div>
          {pay ? <PaywallModal product={pay} tripId={tripId} onClose={() => setPay(null)} /> : null}
        </CardBody>
      </Card>
    );
  }

  if (tier === "byo") {
    return (
      <Card variant="soft">
        <CardBody title="Want our AI to plan it?">
          <p style={{ margin: 0 }}>
            Upgrade to our guardrailed AI chat - no subscription of your own needed. You keep your
            connector too.
          </p>
          <div style={{ marginTop: "var(--space-3)" }}>
            <Button variant="cta" onClick={() => setPay(PRODUCTS.ours)}>
              Upgrade to our AI - US$129
            </Button>
          </div>
          {pay ? <PaywallModal product={pay} tripId={tripId} onClose={() => setPay(null)} /> : null}
        </CardBody>
      </Card>
    );
  }

  // ours
  return (
    <Card variant="soft">
      <CardBody title="Prefer your own AI?">
        <p style={{ margin: 0 }}>
          You&rsquo;re on our AI. You can connect your own ChatGPT, Claude or Gemini as well - both
          stay available.
        </p>
        <div style={{ marginTop: "var(--space-3)" }}>
          <Button variant="secondary" onClick={() => setDowngrade(true)}>
            Use my own AI too
          </Button>
        </div>
        {downgrade ? (
          <Modal title="Use your own AI too" onClose={() => setDowngrade(false)}>
            <p style={{ margin: 0 }}>
              No need to switch or downgrade - there are no refunds, and you&rsquo;re free to use both
              our AI and your own. Follow the connection guide to add your assistant.
            </p>
            <div style={{ marginTop: "var(--space-3)" }}>
              <a href="/connect">
                <Button variant="cta" block>
                  Open the connection guide
                </Button>
              </a>
            </div>
          </Modal>
        ) : null}
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

      {ent.canUseOurAi ? (
        <>
          <ChatHistoryPanel tripId={tripId} />
          <PlanChat tripId={tripId} />
        </>
      ) : null}
      {/* BYO: the chat shell, locked, pointing at the connect/how-to page. */}
      {!ent.canUseOurAi && ent.canUseByoConnector ? <PlanChat tripId={tripId} locked /> : null}
      <PlanUpgrade tier={tier} tripId={tripId} />
    </div>
  );
}
