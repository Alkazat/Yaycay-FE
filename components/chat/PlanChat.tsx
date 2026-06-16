"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { streamPlanChat } from "@/lib/api/planChat";
import type { ChatMessage } from "@/lib/contract-mock/types";
import { ChatThinking } from "@/components/chat/ChatThinking";
import { BrandLogo } from "@/components/brand/AssistantMark";
import { Button } from "@/components/ds";

const SUGGESTIONS = [
  "Plan a relaxed first day",
  "Find something for a rainy afternoon",
  "Add a kid-friendly dinner",
  "Build a 3-day highlights plan",
];

/**
 * The planning chat. On the our-AI tier it is a live, full-height conversation
 * that feels like chatting in the browser (scrolling log, composer pinned at the
 * bottom). On the BYO tier it renders the same shell but locked: the composer is
 * greyed out and the log explains that planning runs from the family's own
 * assistant, with a button to the connect/how-to page.
 */
export function PlanChat({ tripId, locked = false }: { tripId: string; locked?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (preset?: string) => {
    if (locked) return;
    const text = (preset ?? input).trim();
    if (!text || streaming) return;
    setInput("");
    setStreaming(true);

    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
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
    <div className="yc-chat" data-testid="plan-chat">
      <div ref={logRef} data-testid="chat-log" className="yc-chat__log">
        {locked ? (
          <div className="yc-chat__notice" data-testid="chat-byo-lock">
            <span aria-hidden style={{ fontSize: 32 }}>
              🔌
            </span>
            <h3 style={{ margin: "var(--space-2) 0 0" }}>This plan runs on your own AI</h3>
            <p style={{ margin: "var(--space-2) 0 var(--space-3)", color: "var(--text-muted)", fontWeight: 700 }}>
              You&apos;re on Bring-your-own-AI. Connect your assistant to Yaycay once, then plan this
              trip right from your own chat - it talks to Yaycay through a secure connector.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "center", justifyContent: "center" }}>
              <BrandLogo brand="claude" height={24} />
              <BrandLogo brand="openai" height={24} />
              <BrandLogo brand="gemini" height={24} />
            </div>
            <Link
              href="/connect"
              className="yc-btn yc-btn--cta"
              style={{ textDecoration: "none", marginTop: "var(--space-4)" }}
            >
              See how to connect
            </Link>
          </div>
        ) : messages.length === 0 ? (
          <div className="yc-chat__notice" data-testid="chat-empty">
            <span aria-hidden style={{ fontSize: 32 }}>
              ✨
            </span>
            <h3 style={{ margin: "var(--space-2) 0 0" }}>Plan with Yaycay</h3>
            <p style={{ margin: "var(--space-2) 0 var(--space-3)", color: "var(--text-muted)", fontWeight: 700 }}>
              Ask me to add a day, swap an activity, or find something for a rainy afternoon.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", justifyContent: "center" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="yc-btn yc-btn--secondary yc-btn--sm"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isUser = m.role === "user";
            const isPendingAssistant = m.role === "assistant" && m.content === "" && streaming;
            return (
              <div
                key={i}
                className="yc-chat__bubble"
                style={{
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  background: isUser ? "var(--sky-500)" : "var(--surface-sunk)",
                  color: isUser ? "#fff" : "var(--text-body)",
                }}
              >
                {isPendingAssistant ? <ChatThinking /> : m.content}
              </div>
            );
          })
        )}
      </div>

      <div className="yc-chat__composer">
        <input
          aria-label="Message Yaycay"
          value={input}
          disabled={locked || streaming}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder={locked ? "Connect your AI to plan from your own chat" : "Message Yaycay…"}
          style={{
            flex: 1,
            minHeight: 46,
            borderRadius: "var(--radius-md)",
            border: "2.5px solid var(--sand-300)",
            padding: "0 14px",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            background: locked ? "var(--surface-sunk)" : "var(--surface-card)",
            color: locked ? "var(--text-muted)" : "var(--text-body)",
            cursor: locked ? "not-allowed" : "text",
          }}
        />
        <Button variant="cta" onClick={() => send()} disabled={locked || streaming || input.trim().length === 0}>
          {streaming ? "…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
