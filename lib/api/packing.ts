import { endpointUrl, SERVED } from "@/lib/api/http";
import type { PackingAction, PackingList } from "@/lib/contract-mock/types";

async function read(res: Response): Promise<PackingList[]> {
  if (!res.ok) throw new Error(`Packing request failed (${res.status})`);
  return ((await res.json()) as { lists: PackingList[] }).lists;
}

export async function getPacking(tripId: string, signal?: AbortSignal): Promise<PackingList[]> {
  return read(await fetch(endpointUrl(`/trips/${tripId}/packing`, SERVED.packing), { signal }));
}

export async function mutatePacking(tripId: string, action: PackingAction): Promise<PackingList[]> {
  return read(
    await fetch(endpointUrl(`/trips/${tripId}/packing`, SERVED.packing), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(action),
    }),
  );
}
