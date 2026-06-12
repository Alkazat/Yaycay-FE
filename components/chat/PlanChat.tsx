"use client";

import { useState } from "react";
import { streamPlanChat } from "@/lib/api/planChat";
import { Card, CardBody, Button } from "@/components/ds";

interface Msg {
  role: "you" | "yaycay";
  text: string;
}

/** Use-our-AI planning chat with a streaming reply. */
export function PlanChat({ tripId }: { tripId: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "you", text }, { role: "yaycay", text: "" }]);
    try {
      await streamPlanChat(tripId, text, (token) => {
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = {
            role: "yaycay",
            text: next[next.length - 1].text + token,
          };
          return next;
        });
      });
    } catch {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = { role: "yaycay", text: "Sorry, chat hiccuped. Give it another go?" };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <Card>
      <CardBody title="Plan with Yaycay">
        <div data-testid="chat-log" className="yc-stack" style={{ gap: "var(--space-2)" }}>
          {messages.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 700 }}>
              Ask me to add a day, swap an activity, or find something for a rainy afternoon.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "you" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-lg)",
                  background: m.role === "you" ? "var(--sky-500)" : "var(--surface-sunk)",
                  color: m.role === "you" ? "#fff" : "var(--text-body)",
                  fontWeight: 600,
                }}
              >
                {m.text || "..."}
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
          <input
            aria-label="Message Yaycay"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Add a quiet morning on day 3..."
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: "var(--radius-md)",
              border: "2.5px solid var(--sand-300)",
              padding: "0 14px",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
            }}
          />
          <Button variant="cta" onClick={send} disabled={streaming || input.trim().length === 0}>
            {streaming ? "..." : "Send"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
