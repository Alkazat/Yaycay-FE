/**
 * OAuth + connector state store.
 *
 * Holds the three pieces of mutable OAuth state: dynamically-registered clients,
 * short-lived authorization codes, and issued access/refresh grants. Each grant
 * also carries the parent's Supabase session tokens so the MCP tools can call
 * the Yaycay contract on their behalf.
 *
 * BE HANDOFF: this default implementation is in-memory and therefore
 * single-instance and non-durable (state is lost on redeploy / cold start, and
 * is not shared across serverless instances). Production must back this with a
 * durable, shared store (Supabase tables or Redis) implementing `OAuthStore`.
 * See docs/handoffs/08-MCP-CONNECTOR-HANDOFF.md.
 */

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

export interface Grant {
  /** Opaque MCP access token presented as the Bearer to `/api/mcp`. */
  access_token: string;
  refresh_token: string;
  client_id: string;
  scope: string;
  user_id: string;
  supabase_access_token: string;
  supabase_refresh_token: string;
  /** Access-token expiry (epoch ms). */
  expires_at: number;
}

export interface OAuthStore {
  saveClient(client: RegisteredClient): Promise<void>;
  getClient(clientId: string): Promise<RegisteredClient | null>;
  saveCode(code: AuthCode): Promise<void>;
  /** Atomically fetch and delete a code (single-use). */
  takeCode(code: string): Promise<AuthCode | null>;
  saveGrant(grant: Grant): Promise<void>;
  getGrantByAccessToken(token: string): Promise<Grant | null>;
  getGrantByRefreshToken(token: string): Promise<Grant | null>;
  deleteGrant(refreshToken: string): Promise<void>;
}

class InMemoryOAuthStore implements OAuthStore {
  private clients = new Map<string, RegisteredClient>();
  private codes = new Map<string, AuthCode>();
  private byAccess = new Map<string, Grant>();
  private byRefresh = new Map<string, Grant>();

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
    this.byAccess.set(grant.access_token, grant);
    this.byRefresh.set(grant.refresh_token, grant);
  }
  async getGrantByAccessToken(token: string): Promise<Grant | null> {
    const g = this.byAccess.get(token) ?? null;
    if (!g) return null;
    if (g.expires_at < Date.now()) {
      this.byAccess.delete(token);
      return null;
    }
    return g;
  }
  async getGrantByRefreshToken(token: string): Promise<Grant | null> {
    return this.byRefresh.get(token) ?? null;
  }
  async deleteGrant(refreshToken: string): Promise<void> {
    const g = this.byRefresh.get(refreshToken);
    if (g) {
      this.byAccess.delete(g.access_token);
      this.byRefresh.delete(refreshToken);
    }
  }
}

/**
 * Process-wide singleton. Pinned to `globalThis` so Next.js dev/HMR and route
 * handlers in the same instance share one store rather than re-instantiating.
 */
const g = globalThis as unknown as { __yaycayOAuthStore?: OAuthStore };
export const oauthStore: OAuthStore = g.__yaycayOAuthStore ?? (g.__yaycayOAuthStore = new InMemoryOAuthStore());
