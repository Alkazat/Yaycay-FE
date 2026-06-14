/**
 * OAuth + connector state store.
 *
 * Holds the three pieces of mutable OAuth state: dynamically-registered clients,
 * short-lived authorization codes, and issued grants. A grant represents one
 * connected assistant ("connection") and carries the parent's identity so the
 * MCP tools can call the Yaycay contract on their behalf.
 *
 * A connection has a stable `connection_id` that survives token refresh, so it
 * can be listed and revoked from the parent's "Connected assistants" screen.
 * Revocation is the load-bearing security property: a revoked connection must be
 * rejected by `verifyMcpToken` immediately.
 *
 * BE HANDOFF: this default implementation is in-memory and therefore
 * single-instance and non-durable (state is lost on redeploy / cold start, and
 * is not shared across serverless instances). Production must back this with a
 * durable, shared store (Supabase tables or Redis) implementing `OAuthStore`,
 * and the contract `/connectors` + `/connectors/{id}/revoke` must read/write the
 * same records so the parent and admin surfaces share one revocation state.
 * See docs/handoffs/08-MCP-CONNECTOR-HANDOFF.md.
 */

import { createSupabaseOAuthStore, hasDurableOAuthStore } from "@/lib/mcp/store.supabase";

export interface RegisteredClient {
  client_id: string;
  client_name?: string;
  redirect_uris: string[];
  /** When the client was registered (epoch ms). */
  created_at: number;
}

export interface AuthCode {
  code: string;
  client_id: string;
  redirect_uri: string;
  /** PKCE S256 challenge (the only method accepted). */
  code_challenge: string;
  scope: string;
  /** Parent's Supabase identity + tokens captured at consent time. */
  user_id: string;
  supabase_access_token: string;
  supabase_refresh_token: string;
  expires_at: number;
}

export type ConnectionStatus = "active" | "revoked";

export interface Grant {
  /** Stable id for the connection; survives token refresh. */
  connection_id: string;
  /** Opaque MCP access token presented as the Bearer to `/api/mcp`. */
  access_token: string;
  refresh_token: string;
  client_id: string;
  /** Human label for the assistant (from dynamic registration). */
  client_name?: string;
  scope: string;
  user_id: string;
  supabase_access_token: string;
  supabase_refresh_token: string;
  status: ConnectionStatus;
  created_at: number;
  last_used_at: number | null;
  /** Access-token expiry (epoch ms). */
  expires_at: number;
}

/** The parent-facing view of a connection (no tokens). */
export interface ConnectionView {
  connection_id: string;
  client_name: string;
  scopes: string[];
  status: ConnectionStatus;
  created_at: number;
  last_used_at: number | null;
}

export interface OAuthStore {
  saveClient(client: RegisteredClient): Promise<void>;
  getClient(clientId: string): Promise<RegisteredClient | null>;
  saveCode(code: AuthCode): Promise<void>;
  /** Atomically fetch and delete a code (single-use). */
  takeCode(code: string): Promise<AuthCode | null>;
  saveGrant(grant: Grant): Promise<void>;
  /** Active, unexpired grant for a Bearer token, else null. */
  getGrantByAccessToken(token: string): Promise<Grant | null>;
  getGrantByRefreshToken(token: string): Promise<Grant | null>;
  /** Rotate tokens for a connection on refresh, preserving its identity. */
  rotateTokens(
    connectionId: string,
    next: { access_token: string; refresh_token: string; expires_at: number },
  ): Promise<Grant | null>;
  /** Best-effort "last seen" stamp for the connection behind a token. */
  touchLastUsed(token: string): Promise<void>;
  /** List a parent's connections for the self-service screen. */
  listConnectionsByUser(userId: string): Promise<ConnectionView[]>;
  /** Revoke a connection. Returns true if one was revoked for this user. */
  revokeConnection(connectionId: string, userId: string): Promise<boolean>;
}

class InMemoryOAuthStore implements OAuthStore {
  private clients = new Map<string, RegisteredClient>();
  private codes = new Map<string, AuthCode>();
  /** connection_id -> grant (the source of truth). */
  private grants = new Map<string, Grant>();
  /** token indexes -> connection_id. */
  private accessIndex = new Map<string, string>();
  private refreshIndex = new Map<string, string>();

  async saveClient(client: RegisteredClient): Promise<void> {
    this.clients.set(client.client_id, client);
  }
  async getClient(clientId: string): Promise<RegisteredClient | null> {
    return this.clients.get(clientId) ?? null;
  }
  async saveCode(code: AuthCode): Promise<void> {
    this.codes.set(code.code, code);
  }
  async takeCode(code: string): Promise<AuthCode | null> {
    const found = this.codes.get(code) ?? null;
    if (found) this.codes.delete(code);
    if (!found || found.expires_at < Date.now()) return null;
    return found;
  }

  async saveGrant(grant: Grant): Promise<void> {
    this.grants.set(grant.connection_id, grant);
    this.accessIndex.set(grant.access_token, grant.connection_id);
    this.refreshIndex.set(grant.refresh_token, grant.connection_id);
  }

  async getGrantByAccessToken(token: string): Promise<Grant | null> {
    const id = this.accessIndex.get(token);
    if (!id) return null;
    const g = this.grants.get(id);
    if (!g || g.access_token !== token) return null;
    if (g.status !== "active" || g.expires_at < Date.now()) return null;
    return g;
  }

  async getGrantByRefreshToken(token: string): Promise<Grant | null> {
    const id = this.refreshIndex.get(token);
    if (!id) return null;
    const g = this.grants.get(id);
    if (!g || g.refresh_token !== token || g.status !== "active") return null;
    return g;
  }

  async rotateTokens(
    connectionId: string,
    next: { access_token: string; refresh_token: string; expires_at: number },
  ): Promise<Grant | null> {
    const g = this.grants.get(connectionId);
    if (!g || g.status !== "active") return null;
    this.accessIndex.delete(g.access_token);
    this.refreshIndex.delete(g.refresh_token);
    g.access_token = next.access_token;
    g.refresh_token = next.refresh_token;
    g.expires_at = next.expires_at;
    g.last_used_at = Date.now();
    this.accessIndex.set(g.access_token, connectionId);
    this.refreshIndex.set(g.refresh_token, connectionId);
    return g;
  }

  async touchLastUsed(token: string): Promise<void> {
    const id = this.accessIndex.get(token);
    const g = id ? this.grants.get(id) : undefined;
    if (g) g.last_used_at = Date.now();
  }

  async listConnectionsByUser(userId: string): Promise<ConnectionView[]> {
    return [...this.grants.values()]
      .filter((g) => g.user_id === userId)
      .sort((a, b) => b.created_at - a.created_at)
      .map((g) => ({
        connection_id: g.connection_id,
        client_name: g.client_name || "AI assistant",
        scopes: g.scope.split(" ").filter(Boolean),
        status: g.status,
        created_at: g.created_at,
        last_used_at: g.last_used_at,
      }));
  }

  async revokeConnection(connectionId: string, userId: string): Promise<boolean> {
    const g = this.grants.get(connectionId);
    if (!g || g.user_id !== userId) return false;
    g.status = "revoked";
    // Drop the token indexes so the access/refresh tokens stop resolving at once.
    this.accessIndex.delete(g.access_token);
    this.refreshIndex.delete(g.refresh_token);
    return true;
  }
}

/**
 * Process-wide singleton. Pinned to `globalThis` so Next.js dev/HMR and route
 * handlers in the same instance share one store rather than re-instantiating.
 */
const g = globalThis as unknown as { __yaycayOAuthStore?: OAuthStore };
export const oauthStore: OAuthStore =
  g.__yaycayOAuthStore ??
  (g.__yaycayOAuthStore = hasDurableOAuthStore()
    ? createSupabaseOAuthStore()
    : new InMemoryOAuthStore());
