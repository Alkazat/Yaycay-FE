"use client";

import { useState } from "react";
import { streamPlanChat } from "@/lib/api/planChat";
import type { ChatMessage } from "@/lib/contract-mock/types";
import { ChatThinking } from "@/components/chat/ChatThinking";
import { Card, CardBody, Button } from "@/components/ds";

/** Use-our-AI planning chat with a streaming reply (contract `messages`/SSE). */
export function PlanChat({ tripId }: { tripId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setStreaming(true);

    // History sent to the model is everything up to and including this turn.
    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    // Render the user turn + an empty assistant turn we stream into.
    setMessages([...history, { role: "assistant", content: "" }]);

    const appendDelta = (delta: string) =>
      setMessages((m) => {
        const next = [...m];
        const last = next[next.length - 1];
        next[next.length - 1] = { role: "assistant", content: last.content + delta };
        return next;
      });

    try {
      await streamPlanChat(tripId, history, { onDelta: appendDelta });
    } catch {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          content: "Sorry, chat hiccuped. Give it another go?",
        };
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
            messages.map((m, i) => {
              const isUser = m.role === "user";
              const isPendingAssistant = m.role === "assistant" && m.content === "" && streaming;
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-lg)",
                    background: isUser ? "var(--sky-500)" : "var(--surface-sunk)",
                    color: isUser ? "#fff" : "var(--text-body)",
                    fontWeight: 600,
                  }}
                >
                  {isPendingAssistant ? <ChatThinking /> : m.content}
                </div>
              );
            })
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
