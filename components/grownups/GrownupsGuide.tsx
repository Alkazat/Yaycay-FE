"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChecklist, setChecklistItem } from "@/lib/api/grownups";
import { mergeChecklist } from "@/lib/grownupsChecklist";
import type { GrownupsGuide as Guide, TripCost } from "@/lib/contract-mock/types";
import { Card, CardBody, Badge } from "@/components/ds";
import { useTripBudget, useTripCosts } from "@/components/trips/useTripEconomics";

function Logistics({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <strong>{title}:</strong>
      <ul style={{ margin: "4px 0 0", paddingLeft: "var(--space-5)" }}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function fmt(amount: number | null, currency: string): string {
  if (amount == null) return "";
  return `${currency} ${amount.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface BudgetBlockProps {
  tripId: string;
}

function BudgetBlock({ tripId }: BudgetBlockProps) {
  const { data, isLoading } = useTripBudget(tripId);
  if (isLoading) return null;
  const budget = data?.budget;
  if (!budget) return null;

  return (
    <Card variant="soft">
      <CardBody title="Cash budget">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {budget.cash_budget != null ? (
            <p style={{ margin: 0 }}>
              <strong>Cash envelope:</strong> {fmt(budget.cash_budget, budget.base_currency)}
            </p>
          ) : null}
          {budget.daily_cash_budget != null ? (
            <p style={{ margin: 0 }}>
              <strong>Per day:</strong> {fmt(budget.daily_cash_budget, budget.base_currency)}
            </p>
          ) : null}
          {budget.exchange_rate != null ? (
            <p
              style={{
                margin: 0,
                color: "var(--text-muted)",
                fontWeight: 700,
                fontSize: "var(--fs-sm, .9rem)",
              }}
            >
              1 {budget.base_currency} ≈ {budget.exchange_rate} {budget.home_currency}
              {budget.rate_as_of ? ` (as of ${budget.rate_as_of})` : ""}
            </p>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

interface CostsBlockProps {
  tripId: string;
  fallbackCosts?: string[];
  activeDayId: string | null;
}

function CostsBlock({ tripId, fallbackCosts, activeDayId }: CostsBlockProps) {
  const { data, isLoading } = useTripCosts(tripId);
  if (isLoading) return null;

  const apiCosts = data?.costs ?? [];

  // Use structured API costs when available, else fall back to free-text list
  if (apiCosts.length === 0) {
    if (!fallbackCosts || fallbackCosts.length === 0) return null;
    return (
      <div>
        <strong>Costs:</strong>
        <ul style={{ margin: "4px 0 0", paddingLeft: "var(--space-5)" }}>
          {fallbackCosts.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>
    );
  }

  // Group by day, showing active day first if set
  const grouped = new Map<string, TripCost[]>();
  for (const c of apiCosts) {
    const existing = grouped.get(c.day) ?? [];
    existing.push(c);
    grouped.set(c.day, existing);
  }

  // Sort days: active day first, then rest
  const days = [...grouped.keys()].sort((a, b) => {
    if (a === activeDayId) return -1;
    if (b === activeDayId) return 1;
    return a.localeCompare(b);
  });

  const totalBase = apiCosts.reduce((sum, c) => sum + (c.amount_base ?? 0), 0);
  const totalHome = apiCosts.reduce((sum, c) => sum + (c.amount_home ?? 0), 0);
  const baseCurrency = apiCosts[0]?.currency_base ?? "";
  const homeCurrency = apiCosts[0]?.currency_home ?? "";

  return (
    <Card variant="soft">
      <CardBody title="Costs">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {days.map((day) => {
            const items = grouped.get(day)!;
            return (
              <div key={day}>
                <p
                  style={{
                    margin: "0 0 var(--space-1)",
                    fontWeight: 700,
                    fontSize: "var(--fs-sm, .9rem)",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {day}
                </p>
                {items.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "var(--space-2)",
                      padding: "var(--space-1) 0",
                      borderBottom: "1px solid var(--sand-200, #e8ddc8)",
                    }}
                  >
                    <span style={{ fontWeight: 600, flex: 1 }}>
                      {c.label}
                      {c.paid ? (
                        <Badge tone="meadow" style={{ marginLeft: "var(--space-2)" }}>
                          paid
                        </Badge>
                      ) : null}
                    </span>
                    <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                      {fmt(c.amount_base, c.currency_base)}
                      {c.amount_home != null ? (
                        <span
                          style={{ fontWeight: 600, color: "var(--text-muted)", marginLeft: 4 }}
                        >
                          ({fmt(c.amount_home, c.currency_home)})
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "var(--space-2) 0 0",
              borderTop: "2px solid var(--royal-300, #7aabf4)",
              fontWeight: 800,
            }}
          >
            <span>Total</span>
            <span>
              {fmt(totalBase, baseCurrency)}
              {totalHome > 0 ? (
                <span style={{ fontWeight: 700, color: "var(--text-muted)", marginLeft: 4 }}>
                  ({fmt(totalHome, homeCurrency)})
                </span>
              ) : null}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/** Grown-ups guide: phases, essentials, per-day logistics, persisted checklist. */
export function GrownupsGuide({
  tripId,
  guide,
  activeDayId,
}: {
  tripId: string;
  guide: Guide;
  activeDayId: string | null;
}) {
  const queryClient = useQueryClient();
  const key = ["checklist", tripId] as const;
  const checklistQuery = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getChecklist(tripId, signal),
  });

  const toggle = useMutation({
    mutationFn: ({ item, checked }: { item: string; checked: boolean }) =>
      setChecklistItem(tripId, item, checked),
    onSuccess: (items) => queryClient.setQueryData(key, items),
  });

  const dayLogistics = guide.days?.find((d) => d.day_id === activeDayId);
  // Contract persists only ticks (keyed by `item`); labels come from the trip
  // content seed. Merge them into render rows.
  const rows = mergeChecklist(guide.checklist ?? [], checklistQuery.data);

  return (
    <div className="yc-stack yc-grownups">
      <div className="yc-grownups__intro">
        <span className="yc-grownups__cup" aria-hidden="true">
          ☕
        </span>
        <div>
          <strong className="yc-grownups__lead">For the grown-ups</strong>
          <p className="yc-grownups__sub">
            The planning side - bookings, costs, transport and grown-up food. The kids&apos;
            adventure is all theirs; this is your bit.
          </p>
        </div>
      </div>
      <Card variant="soft">
        <CardBody title="Grown-ups guide">
          {guide.phases && guide.phases.length > 0 ? (
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {guide.phases.map((p) => (
                <Badge key={p.label} tone="soft">
                  {p.label} ({p.range})
                </Badge>
              ))}
            </div>
          ) : null}
          {guide.essentials ? (
            <p style={{ margin: 0 }}>
              <strong>Essentials:</strong> {guide.essentials}
            </p>
          ) : null}
          {guide.transport ? (
            <p style={{ margin: 0 }}>
              <strong>Getting around:</strong> {guide.transport}
            </p>
          ) : null}
        </CardBody>
      </Card>

      <BudgetBlock tripId={tripId} />

      <CostsBlock tripId={tripId} fallbackCosts={dayLogistics?.costs} activeDayId={activeDayId} />

      {dayLogistics ? (
        <Card variant="soft">
          <CardBody title="This day's logistics">
            <Logistics title="Bookings" items={dayLogistics.bookings} />
            <Logistics title="Transport" items={dayLogistics.transport} />
            <Logistics title="Tips" items={dayLogistics.tips} />
            {dayLogistics.allergy && dayLogistics.allergy.length > 0 ? (
              <div>
                <strong style={{ color: "var(--coral-500)" }}>Allergy:</strong>
                <ul
                  style={{
                    margin: "4px 0 0",
                    paddingLeft: "var(--space-5)",
                    color: "var(--coral-500)",
                  }}
                >
                  {dayLogistics.allergy.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <Card variant="soft">
        <CardBody title="Booking checklist">
          {rows.map((row) => (
            <label
              key={row.item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                minHeight: 44,
                cursor: "pointer",
                fontWeight: 700,
                color: row.checked ? "var(--text-muted)" : "var(--text-body)",
                textDecoration: row.checked ? "line-through" : "none",
              }}
            >
              <input
                type="checkbox"
                checked={row.checked}
                onChange={(e) => toggle.mutate({ item: row.item, checked: e.target.checked })}
                style={{ width: 22, height: 22, accentColor: "var(--meadow-400)" }}
              />
              {row.label}
            </label>
          ))}
        </CardBody>
      </Card>
      <style>{`
        .yc-grownups__intro {
          display: flex; gap: var(--space-3); align-items: flex-start;
          padding: var(--space-4);
          background: var(--royal-700, #0a4c8b); color: #fff;
          border-radius: var(--radius-xl, 20px);
          box-shadow: var(--card-lift);
        }
        .yc-grownups__cup { font-size: 28px; line-height: 1; }
        .yc-grownups__lead { font-family: var(--font-display); font-size: var(--fs-h4, 1.1rem); display: block; }
        .yc-grownups__sub { margin: 4px 0 0; opacity: .85; font-weight: 600; font-size: var(--fs-sm, .9rem); }
      `}</style>
    </div>
  );
}
