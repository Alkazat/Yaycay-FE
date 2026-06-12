import { apiFetch, SERVED } from "@/lib/api/http";

/**
 * Stream a planning-chat reply (SSE `PlanChatEvent` tokens). Calls `onToken`
 * for each token as it arrives. Mock-backed until the live endpoint is wired.
 */
export async function streamPlanChat(
  tripId: string,
  message: string,
  onToken: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await apiFetch(`/trips/${tripId}/plan/chat`, SERVED.planChat, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Chat failed (${res.status})`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const evt of events) {
      const line = evt.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      try {
        const data = JSON.parse(line.slice(6)) as { type: string; text?: string };
        if (data.type === "token" && data.text) onToken(data.text);
      } catch {
        // ignore malformed event
      }
    }
  }
}
