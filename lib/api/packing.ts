import { apiFetch, SERVED } from "@/lib/api/http";
import { getAccessToken } from "@/lib/auth/session";
import type { PackingAction, PackingList } from "@/lib/contract-mock/types";

async function read(res: Response): Promise<PackingList[]> {
  if (!res.ok) throw new Error(`Packing request failed (${res.status})`);
  return ((await res.json()) as { lists: PackingList[] }).lists;
}

export async function getPacking(tripId: string, signal?: AbortSignal): Promise<PackingList[]> {
  // Trips are authenticated; carry the signed-in user's JWT when available.
  const accessToken = await getAccessToken();
  return read(await apiFetch(`/trips/${tripId}/packing`, SERVED.packing, { signal, accessToken }));
}

export async function mutatePacking(tripId: string, action: PackingAction): Promise<PackingList[]> {
  const accessToken = await getAccessToken();
  return read(
    await apiFetch(`/trips/${tripId}/packing`, SERVED.packing, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(action),
      accessToken,
    }),
  );
}
