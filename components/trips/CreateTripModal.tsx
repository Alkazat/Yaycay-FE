"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrip } from "@/lib/api/trips";
import { createCheckoutSession } from "@/lib/api/account";
import { PRODUCTS } from "@/lib/paywall";
import { Modal } from "@/components/ui/Modal";
import { Button, Input } from "@/components/ds";

type Plan = "free" | "ours" | "byo";

const PLANS: { key: Plan; title: string; price: string; blurb: string }[] = [
  { key: "free", title: "Single day", price: "Free", blurb: "A taster day. No card needed." },
  { key: "ours", title: "Full holiday - our AI", price: "US$129", blurb: "Every day unlocked, our guardrailed chat." },
  { key: "byo", title: "Full holiday - your AI", price: "US$59", blurb: "Connect your own ChatGPT, Claude or Gemini." },
];

function PlanOption({
  plan,
  selected,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "var(--space-3)",
        textAlign: "left",
        padding: "var(--space-3)",
        borderRadius: "var(--radius-md, 12px)",
        border: selected ? "2.5px solid var(--sky-500)" : "2.5px solid var(--sand-200, #e7e2d8)",
        background: selected ? "var(--sky-50)" : "var(--surface, #fff)",
        cursor: "pointer",
      }}
    >
      <span>
        <span style={{ fontWeight: 800, display: "block" }}>
          {plan.title} {selected ? "(selected)" : ""}
        </span>
        <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>
          {plan.blurb}
        </span>
      </span>
      <span style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{plan.price}</span>
    </button>
  );
}

/**
 * Create a trip. A new trip is free + single-day; choosing a full-holiday plan
 * creates the trip then opens Checkout (paywall) for that product.
 */
export function CreateTripModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [plan, setPlan] = useState<Plan>("free");

  const create = useMutation({
    mutationFn: () =>
      createTrip({
        destination: destination.trim(),
        start_date: start || undefined,
        end_date: end || undefined,
      }),
    onSuccess: async (trip) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      if (plan === "free") {
        router.push(`/trips/${trip.id}`);
        return;
      }
      const product = plan === "ours" ? PRODUCTS.ours : PRODUCTS.byo;
      const { url } = await createCheckoutSession({ price_id: product.id, trip_id: trip.id });
      window.location.href = url;
    },
  });

  const canCreate = destination.trim().length > 1 && !create.isPending;
  const cta =
    plan === "free" ? "Create my day (free)" : `Continue - ${plan === "ours" ? "US$129" : "US$59"}`;

  return (
    <Modal title="New trip" onClose={onClose}>
      <div className="yc-stack" style={{ gap: "var(--space-3)" }}>
        <Input
          label="Where to?"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Singapore"
        />
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Input label="From" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input label="To" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>

        <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
          <span style={{ fontWeight: 800 }}>Choose your plan</span>
          {PLANS.map((p) => (
            <PlanOption key={p.key} plan={p} selected={plan === p.key} onSelect={() => setPlan(p.key)} />
          ))}
        </div>

        <Button variant="cta" block onClick={() => create.mutate()} disabled={!canCreate}>
          {create.isPending ? "Creating..." : cta}
        </Button>
        {create.isError ? (
          <p style={{ margin: 0, color: "var(--coral-500)", fontWeight: 700 }}>
            We couldn&rsquo;t create that trip. Give it another go?
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
