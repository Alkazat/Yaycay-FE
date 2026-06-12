"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPacking, mutatePacking } from "@/lib/api/packing";
import { listCount, allPacked } from "@/lib/packing";
import type { PackingAction, PackingList } from "@/lib/contract-mock/types";
import { Tabs, Card, CardBody, Button, ProgressMeter, Badge } from "@/components/ds";

export function PackingClient({ tripId }: { tripId: string }) {
  const queryClient = useQueryClient();
  const key = ["packing", tripId] as const;
  const query = useQuery({ queryKey: key, queryFn: ({ signal }) => getPacking(tripId, signal) });

  const mutate = useMutation({
    mutationFn: (action: PackingAction) => mutatePacking(tripId, action),
    onSuccess: (lists) => queryClient.setQueryData(key, lists),
  });

  const lists = query.data ?? [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const list: PackingList | undefined = lists.find((l) => l.id === (activeId ?? lists[0]?.id));
  const [draft, setDraft] = useState<Record<string, string>>({});

  if (query.isLoading) return <p>Loading the packing list...</p>;

  return (
    <div className="yc-stack" data-testid="packing">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Packing</h1>
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Print
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => mutate.mutate({ action: "reset" })}
          >
            Reset ticks
          </Button>
        </div>
      </header>

      {lists.length > 0 ? (
        <Tabs
          value={list?.id ?? ""}
          onChange={setActiveId}
          tabs={lists.map((l) => ({ value: l.id, label: l.label }))}
        />
      ) : null}

      {list ? (
        <>
          {(() => {
            const c = listCount(list);
            return (
              <Card variant="soft">
                <CardBody>
                  <ProgressMeter
                    value={c.packed}
                    max={Math.max(c.total, 1)}
                    label={`${list.label} packed`}
                    valueText={`${c.packed} / ${c.total}`}
                    tone="aqua"
                  />
                  {allPacked(list) ? (
                    <Badge tone="meadow">All packed! Let&apos;s go.</Badge>
                  ) : null}
                </CardBody>
              </Card>
            );
          })()}

          {list.sections.map((section) => (
            <Card key={section.id} variant="soft">
              <CardBody title={section.title}>
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minHeight: 44 }}
                  >
                    <label style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flex: 1, cursor: "pointer", textDecoration: item.checked ? "line-through" : "none", color: item.checked ? "var(--text-muted)" : "var(--text-body)", fontWeight: 700 }}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) =>
                          mutate.mutate({ action: "tick", list_id: list.id, item_id: item.id, checked: e.target.checked })
                        }
                        style={{ width: 22, height: 22, accentColor: "var(--meadow-400)" }}
                      />
                      {item.label}
                      {item.qty ? ` x${item.qty}` : ""}
                    </label>
                    <button
                      type="button"
                      aria-label={`Remove ${item.label}`}
                      onClick={() => mutate.mutate({ action: "delete", list_id: list.id, item_id: item.id })}
                      className="yc-btn yc-btn--ghost yc-btn--sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                  <input
                    aria-label={`Add to ${section.title}`}
                    placeholder="Add an item"
                    value={draft[section.id] ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, [section.id]: e.target.value }))}
                    style={{
                      flex: 1,
                      minHeight: 44,
                      borderRadius: "var(--radius-md)",
                      border: "2.5px solid var(--sand-300)",
                      padding: "0 12px",
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!((draft[section.id] ?? "").trim())}
                    onClick={() => {
                      const label = (draft[section.id] ?? "").trim();
                      if (!label) return;
                      mutate.mutate({ action: "add", list_id: list.id, section_id: section.id, label });
                      setDraft((d) => ({ ...d, [section.id]: "" }));
                    }}
                  >
                    Add
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </>
      ) : null}
    </div>
  );
}
