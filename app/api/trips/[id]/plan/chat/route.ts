import type { NextRequest } from "next/server";

/**
 * MOCK planning chat - streams an SSE token stream like the served
 * `POST /trips/:id/plan/chat`. Canned, guardrailed-sounding reply so the
 * streaming UI can be built before the live AI harness is wired.
 */
export async function POST(request: NextRequest) {
  let message = "";
  try {
    message = ((await request.json()) as { message?: string }).message ?? "";
  } catch {
    // ignore
  }

  const reply =
    `Great idea. Here is how I would weave "${message.slice(0, 60) || "that"}" into the trip: ` +
    "I'd add a relaxed morning, keep the afternoon free for the beach, and flag any food stops " +
    "for allergy checks. Want me to pencil it into a specific day?";
  const tokens = reply.split(/(\s+)/);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const t of tokens) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", text: t })}\n\n`));
        await new Promise((r) => setTimeout(r, 15));
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
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
