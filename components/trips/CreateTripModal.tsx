"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTrip } from "@/lib/api/trips";
import { createCheckoutSession } from "@/lib/api/account";
import { getCatalogue, priceOf } from "@/lib/api/catalogue";
import { PRODUCTS } from "@/lib/paywall";
import { Modal } from "@/components/ui/Modal";
import { Button, Input, Select } from "@/components/ds";

type Plan = "free" | "ours" | "byo";
type DateMode = "exact" | "month" | "unsure";

/** Next 15 months as { value: "YYYY-MM", label: "Mon YYYY" }. */
function upcomingMonths(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 15; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    out.push({ value, label });
  }
  return out;
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--radius-pill, 999px)",
            cursor: "pointer",
            fontWeight: 700,
            border: value === o.value ? "2.5px solid var(--sky-500)" : "2px solid var(--sand-200, #e7e2d8)",
            background: value === o.value ? "var(--sky-50)" : "var(--surface, #fff)",
            color: "var(--royal-700)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PlanOption({
  title,
  price,
  blurb,
  selected,
  onSelect,
}: {
  title: string;
  price: string;
  blurb: string;
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
          {title} {selected ? "(selected)" : ""}
        </span>
        <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: "var(--fs-sm)" }}>{blurb}</span>
      </span>
      <span style={{ fontWeight: 800, whiteSpace: "nowrap" }}>{price}</span>
    </button>
  );
}

/**
 * Create a trip. A new trip is free + single-day; choosing a full-holiday plan
 * creates the trip then opens Checkout (paywall). Prices come from the live
 * catalogue (Stripe-sourced); dates can be exact, a month, or undecided.
 */
export function CreateTripModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [destination, setDestination] = useState("");
  const [dateMode, setDateMode] = useState<DateMode>("exact");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [month, setMonth] = useState("");
  const [plan, setPlan] = useState<Plan>("free");

  const months = useMemo(upcomingMonths, []);
  const catalogue = useQuery({ queryKey: ["catalogue"], queryFn: ({ signal }) => getCatalogue(signal) });
  const oursPrice = priceOf(catalogue.data, PRODUCTS.ours.id, PRODUCTS.ours.priceUsd);
  const byoPrice = priceOf(catalogue.data, PRODUCTS.byo.id, PRODUCTS.byo.priceUsd);

  const dates = (): { start_date?: string; end_date?: string } => {
    if (dateMode === "exact") return { start_date: start || undefined, end_date: end || undefined };
    if (dateMode === "month" && month) return { start_date: `${month}-01` };
    return {};
  };

  const create = useMutation({
    mutationFn: () => createTrip({ destination: destination.trim(), ...dates() }),
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
    plan === "free"
      ? "Create my day (free)"
      : `Continue - US$${plan === "ours" ? oursPrice : byoPrice}`;

  return (
    <Modal title="New trip" onClose={onClose}>
      <div className="yc-stack" style={{ gap: "var(--space-3)" }}>
        <Input
          label="Where to?"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Singapore"
        />

        <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
          <span style={{ fontWeight: 800 }}>When?</span>
          <Segmented
            options={[
              { value: "exact", label: "Exact dates" },
              { value: "month", label: "A month" },
              { value: "unsure", label: "Not sure yet" },
            ]}
            value={dateMode}
            onChange={(v) => setDateMode(v as DateMode)}
          />
          {dateMode === "exact" ? (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Input label="From" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              <Input label="To" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          ) : null}
          {dateMode === "month" ? (
            <Select
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              options={[{ value: "", label: "Pick a month" }, ...months]}
            />
          ) : null}
          {dateMode === "unsure" ? (
            <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
              No problem - you can set dates any time.
            </p>
          ) : null}
        </div>

        <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
          <span style={{ fontWeight: 800 }}>Choose your plan</span>
          <PlanOption
            title="Single day"
            price="Free"
            blurb="A taster day. No card needed."
            selected={plan === "free"}
            onSelect={() => setPlan("free")}
          />
          <PlanOption
            title="Full holiday - our AI"
            price={`US$${oursPrice}`}
            blurb="Every day unlocked, our guardrailed chat."
            selected={plan === "ours"}
            onSelect={() => setPlan("ours")}
          />
          <PlanOption
            title="Full holiday - your AI"
            price={`US$${byoPrice}`}
            blurb="Connect your own ChatGPT, Claude or Gemini."
            selected={plan === "byo"}
            onSelect={() => setPlan("byo")}
          />
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
