import type { NextRequest } from "next/server";
import type { ChatMessage } from "@/lib/contract-mock/types";

/**
 * MOCK planning chat - streams the contract SSE shape (`PlanChatEvent` frames
 * ending in `data: [DONE]`). Canned reply so the streaming UI works before the
 * live AI harness is wired.
 */
export async function POST(request: NextRequest) {
  let messages: ChatMessage[] = [];
  try {
    messages = ((await request.json()) as { messages?: ChatMessage[] }).messages ?? [];
  } catch {
    // ignore
  }
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "that";

  const reply =
    `Great idea. Here is how I would weave "${lastUser.slice(0, 60)}" into the trip: ` +
    "I'd add a relaxed morning, keep the afternoon free for the beach, and flag any food stops " +
    "for allergy checks. Want me to pencil it into a specific day?";
  const chunks = reply.split(/(\s+)/);

  const encoder = new TextEncoder();
  const frame = (obj: unknown) => encoder.encode(`data: ${JSON.stringify(obj)}\n\n`);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(frame({ start: true, generated_by: "fallback" }));
      for (const c of chunks) {
        controller.enqueue(frame({ delta: c }));
        await new Promise((r) => setTimeout(r, 15));
      }
      controller.enqueue(frame({ done: true, job_id: null }));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
