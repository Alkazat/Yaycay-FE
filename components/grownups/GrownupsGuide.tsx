"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChecklist, setChecklistItem } from "@/lib/api/grownups";
import type { ChecklistItem, GrownupsGuide as Guide } from "@/lib/contract-mock/types";
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
    mutationFn: ({ itemId, done }: { itemId: string; done: boolean }) =>
      setChecklistItem(tripId, itemId, done),
    onSuccess: (items) => queryClient.setQueryData(key, items),
  });

  const dayLogistics = guide.days?.find((d) => d.day_id === activeDayId);
  const items = checklistQuery.data ?? [];
  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <div className="yc-stack">
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
          {groups.map((group) => (
            <div key={group} style={{ marginBottom: "var(--space-3)" }}>
              <strong style={{ color: "var(--royal-700)" }}>{group}</strong>
              {items
                .filter((i) => i.group === group)
                .map((item: ChecklistItem) => (
                  <label
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      minHeight: 44,
                      cursor: "pointer",
                      fontWeight: 700,
                      color: item.done ? "var(--text-muted)" : "var(--text-body)",
                      textDecoration: item.done ? "line-through" : "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(e) => toggle.mutate({ itemId: item.id, done: e.target.checked })}
                      style={{ width: 22, height: 22, accentColor: "var(--meadow-400)" }}
                    />
                    {item.label}
                  </label>
                ))}
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
