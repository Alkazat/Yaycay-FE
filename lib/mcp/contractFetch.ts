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
  opts: { origin: string; accessToken: string; method?: string; body?: unknown },
): Promise<Response> {
  const live = hasLiveApi();
  const url = live ? `${env.apiBase.replace(/\/$/, "")}${path}` : `${opts.origin}/api${path}`;

  const headers = new Headers();
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

/** Fetch + parse JSON, throwing a tool-friendly message on a non-2xx. */
export async function contractJson<T>(
  path: string,
  opts: { origin: string; accessToken: string; method?: string; body?: unknown },
): Promise<T> {
  const res = await contractFetch(path, opts);
  if (!res.ok) {
    throw new Error(`Yaycay API ${opts.method ?? "GET"} ${path} failed (${res.status})`);
  }
  return (await res.json()) as T;
}
