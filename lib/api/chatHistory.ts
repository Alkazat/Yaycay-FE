import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { ChatHistory, ChatHistoryMessage } from "@/lib/contract-mock/types";

/**
 * The persisted, reopenable planning-chat transcript (`GET /trips/:id/chat`).
 * Distinct from the streaming `POST /trips/:id/plan/chat`: this is the stored
 * record, including `import_chip` turns (e.g. a forwarded hotel confirmation).
 */
export async function getChatHistory(
  tripId: string,
  signal?: AbortSignal,
): Promise<ChatHistoryMessage[]> {
  const accessToken = await getAccessToken();
  const res = await apiFetch(`/trips/${tripId}/chat`, SERVED.chatHistory, { signal, accessToken });
  if (!res.ok) throw new Error(`Failed to load chat history (${res.status})`);
  return ((await res.json()) as ChatHistory).messages;
}
