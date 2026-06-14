"use client";

import { useQuery } from "@tanstack/react-query";
import { getChatHistory } from "@/lib/api/chatHistory";
import type { ChatHistoryMessage } from "@/lib/contract-mock/types";
import { Card, CardBody, Badge } from "@/components/ds";

/** An imported artefact (e.g. a forwarded hotel confirmation) shown as a chip. */
function ImportChip({ message }: { message: ChatHistoryMessage }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-2) var(--space-3)",
          borderRadius: "var(--radius-md, 12px)",
          border: "2px dashed var(--sky-300, #9ec7ef)",
          background: "var(--sky-50, #f0f7ff)",
          fontWeight: 800,
          fontSize: "var(--fs-sm)",
        }}
      >
        <Badge tone="sky">Imported</Badge>
        {message.content}
      </span>
    </div>
  );
}

function Bubble({ message }: { message: ChatHistoryMessage }) {
  const mine = message.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
      <span
        style={{
          maxWidth: "85%",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-md, 12px)",
          background: mine ? "var(--sky-500, #2f86d8)" : "var(--surface-sunken, #f4f4f5)",
          color: mine ? "#fff" : "var(--text-body)",
          fontWeight: 600,
        }}
      >
        {message.content}
      </span>
    </div>
  );
}

/**
 * The reopenable planning-chat transcript for a trip. Read-only history (the
 * live planner is `PlanChat`); renders text turns as bubbles and `import_chip`
 * turns as imported-artefact chips.
 */
export function ChatHistoryPanel({ tripId }: { tripId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["chat-history", tripId],
    queryFn: ({ signal }) => getChatHistory(tripId, signal),
  });

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardBody title="Your planning conversation">
        <div className="yc-stack" style={{ gap: "var(--space-2)" }}>
          {data
            .slice()
            .sort((a, b) => a.seq - b.seq)
            .map((m) =>
              m.kind === "import_chip" ? (
                <ImportChip key={m.id} message={m} />
              ) : (
                <Bubble key={m.id} message={m} />
              ),
            )}
        </div>
      </CardBody>
    </Card>
  );
}
