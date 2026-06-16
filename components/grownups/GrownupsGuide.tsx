"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChecklist, setChecklistItem } from "@/lib/api/grownups";
import { mergeChecklist } from "@/lib/grownupsChecklist";
import type { GrownupsGuide as Guide } from "@/lib/contract-mock/types";
import { Card, CardBody, Badge } from "@/components/ds";

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

      {dayLogistics ? (
        <Card variant="soft">
          <CardBody title="This day's logistics">
            <Logistics title="Bookings" items={dayLogistics.bookings} />
            <Logistics title="Costs" items={dayLogistics.costs} />
            <Logistics title="Transport" items={dayLogistics.transport} />
            <Logistics title="Tips" items={dayLogistics.tips} />
            {dayLogistics.allergy && dayLogistics.allergy.length > 0 ? (
              <div>
                <strong style={{ color: "var(--coral-500)" }}>Allergy:</strong>
                <ul style={{ margin: "4px 0 0", paddingLeft: "var(--space-5)", color: "var(--coral-500)" }}>
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
