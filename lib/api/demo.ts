import { endpointUrl, SERVED } from "@/lib/api/http";
import type {
  DemoGenerateDayRequest,
  DemoGenerateDayResponse,
} from "@/lib/contract-mock/types";

/**
 * Call the demo-day generator.
 *
 * - When `NEXT_PUBLIC_API_BASE` is set, hit the real BE endpoint.
 * - Otherwise hit the in-repo mock route handler (`/api/demo/generate-day`).
 *
 * The FE never invents the shape; both paths return the same
 * `DemoGenerateDayResponse` contract DTO.
 */
export async function generateDemoDay(
  req: DemoGenerateDayRequest,
  init?: { signal?: AbortSignal },
): Promise<DemoGenerateDayResponse> {
  const url = endpointUrl("/demo/generate-day", SERVED.demoGenerateDay);

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
    signal: init?.signal,
  });

  if (!res.ok) {
    throw new Error(`Demo generation failed (${res.status})`);
  }
  return (await res.json()) as DemoGenerateDayResponse;
}
