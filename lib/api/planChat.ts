import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { ChatMessage, PlanChatEvent } from "@/lib/contract-mock/types";

/**
 * Stream a planning-chat reply (contract `POST /trips/:id/plan/chat`).
 *
 * Body is `{ messages }`; the response is a `text/event-stream` of
 * `PlanChatEvent` frames ending in a literal `data: [DONE]`. `onStart` fires
 * once with `generated_by`; `onDelta` fires per text chunk. Authenticated (the
 * user's JWT is attached). Mock-backed until the live API base is set.
 */
export async function streamPlanChat(
  tripId: string,
  messages: ChatMessage[],
  handlers: { onDelta: (text: string) => void; onStart?: (generatedBy: "ai" | "fallback") => void },
  signal?: AbortSignal,
): Promise<void> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/plan/chat`, SERVED.planChat, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
    accessToken,
  });
  if (!res.ok || !res.body) throw new Error(`Chat failed (${res.status})`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const line = frame.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = line.slice(line.indexOf(":") + 1).trim();
      if (payload === "[DONE]") return;

      let event: PlanChatEvent;
      try {
        event = JSON.parse(payload) as PlanChatEvent;
      } catch {
        continue; // ignore malformed frame
      }
      if ("error" in event) throw new Error(event.error);
      if ("start" in event) handlers.onStart?.(event.generated_by);
      else if ("delta" in event) handlers.onDelta(event.delta);
    }
  }
}
