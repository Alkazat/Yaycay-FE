/**
 * Server-side call into the Yaycay contract on behalf of a connected parent.
 *
 * Mirrors the hybrid routing in `lib/api/http.ts`: when a live BE is configured
 * the request goes to `${apiBase}${path}` with the parent's Supabase JWT (and
 * the anon apikey the gateway requires); otherwise it falls back to the in-repo
 * mock route handlers under `${origin}/api${path}`. Either way the MCP tools see
 * the same contract DTOs.
 */
import { env, hasLiveApi } from "@/lib/env";

export async function contractFetch(
  path: string,
  opts: {
    origin: string;
    accessToken: string;
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  },
): Promise<Response> {
  const live = hasLiveApi();
  const url = live ? `${env.apiBase.replace(/\/$/, "")}${path}` : `${opts.origin}/api${path}`;

  const headers = new Headers(opts.headers);
  if (opts.body !== undefined) headers.set("content-type", "application/json");
  if (live && env.supabaseAnonKey) {
    headers.set("apikey", env.supabaseAnonKey);
    headers.set("Authorization", `Bearer ${opts.accessToken || env.supabaseAnonKey}`);
  }

  return fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

/** A non-2xx from the Yaycay contract, carrying the status so MCP tools can map
 * it to a friendly, on-brand message (404 -> "add the trip in the app", etc.). */
export class ContractError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly method: string,
  ) {
    super(`Yaycay API ${method} ${path} failed (${status})`);
    this.name = "ContractError";
  }
}

/** Fetch + parse JSON, throwing a status-bearing ContractError on a non-2xx. */
export async function contractJson<T>(
  path: string,
  opts: {
    origin: string;
    accessToken: string;
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const res = await contractFetch(path, opts);
  if (!res.ok) {
    throw new ContractError(res.status, path, opts.method ?? "GET");
  }
  return (await res.json()) as T;
}
