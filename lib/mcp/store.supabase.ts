// Durable, shared OAuthStore backed by Supabase. SERVER-ONLY.
//
// This is the production backing main's in-memory store asks for (see store.ts
// "BE HANDOFF"). It implements the same `OAuthStore` interface so the AS route
// handlers are unchanged. State survives redeploys and is shared across
// instances, and the parent/admin "Connected assistants" surfaces read the same
// rows so revocation is one source of truth.
//
// At-rest discipline (lib/mcp/crypto.ts):
//   - issued access/refresh tokens are looked up by SHA-256 hash and stored
//     encrypted (so the plaintext the interface returns can be reconstructed
//     without keeping a plaintext index),
//   - the parent's captured Supabase tokens are stored encrypted.
//
// REQUIRED BE SCHEMA (gap to close before enabling): tables oauth_clients,
// oauth_codes, oauth_grants matching THIS model. Note BE develop currently has a
// divergent `oauth_grants` (status/token_version, no captured tokens); that must
// be reconciled to this shape. Until then this store stays inert (see
// hasDurableOAuthStore) and the in-memory default is used.

import { serviceClient, hasServiceRole } from "@/lib/supabase/service";
import { decryptSecret, encryptSecret, sha256Hex } from "@/lib/mcp/crypto";
import type {
  AuthCode,
  ConnectionView,
  Grant,
  OAuthStore,
  RegisteredClient,
} from "@/lib/mcp/store";

const CLIENTS = "oauth_clients";
const CODES = "oauth_codes";
const GRANTS = "oauth_grants";

const ms = (iso: string | null | undefined): number => (iso ? Date.parse(iso) : 0);
const iso = (epochMs: number): string => new Date(epochMs).toISOString();

interface GrantRow {
  connection_id: string;
  client_id: string;
  client_name: string | null;
  scope: string;
  user_id: string;
  access_token_enc: string;
  refresh_token_enc: string;
  supabase_access_token: string;
  supabase_refresh_token: string;
  status: "active" | "revoked";
  created_at: string;
  last_used_at: string | null;
  expires_at: string;
}

async function rowToGrant(row: GrantRow): Promise<Grant> {
  const [access_token, refresh_token, supabase_access_token, supabase_refresh_token] =
    await Promise.all([
      decryptSecret(row.access_token_enc),
      decryptSecret(row.refresh_token_enc),
      decryptSecret(row.supabase_access_token),
      decryptSecret(row.supabase_refresh_token),
    ]);
  return {
    connection_id: row.connection_id,
    access_token,
    refresh_token,
    client_id: row.client_id,
    client_name: row.client_name ?? undefined,
    scope: row.scope,
    user_id: row.user_id,
    supabase_access_token,
    supabase_refresh_token,
    status: row.status,
    created_at: ms(row.created_at),
    last_used_at: row.last_used_at ? ms(row.last_used_at) : null,
    expires_at: ms(row.expires_at),
  };
}

const GRANT_COLUMNS =
  "connection_id, client_id, client_name, scope, user_id, access_token_enc, " +
  "refresh_token_enc, supabase_access_token, supabase_refresh_token, status, " +
  "created_at, last_used_at, expires_at";

class SupabaseOAuthStore implements OAuthStore {
  async saveClient(client: RegisteredClient): Promise<void> {
    const { error } = await serviceClient()
      .from(CLIENTS)
      .upsert(
        {
          client_id: client.client_id,
          client_name: client.client_name ?? null,
          redirect_uris: client.redirect_uris,
          created_at: iso(client.created_at),
        },
        { onConflict: "client_id" },
      );
    if (error) throw new Error(error.message);
  }

  async getClient(clientId: string): Promise<RegisteredClient | null> {
    const { data, error } = await serviceClient()
      .from(CLIENTS)
      .select("client_id, client_name, redirect_uris, created_at")
      .eq("client_id", clientId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      client_id: data.client_id,
      client_name: data.client_name ?? undefined,
      redirect_uris: data.redirect_uris ?? [],
      created_at: ms(data.created_at),
    };
  }

  async saveCode(code: AuthCode): Promise<void> {
    const [sat, srt] = await Promise.all([
      encryptSecret(code.supabase_access_token),
      encryptSecret(code.supabase_refresh_token),
    ]);
    const { error } = await serviceClient()
      .from(CODES)
      .insert({
        code: code.code,
        client_id: code.client_id,
        redirect_uri: code.redirect_uri,
        code_challenge: code.code_challenge,
        scope: code.scope,
        user_id: code.user_id,
        supabase_access_token: sat,
        supabase_refresh_token: srt,
        expires_at: iso(code.expires_at),
      });
    if (error) throw new Error(error.message);
  }

  async takeCode(code: string): Promise<AuthCode | null> {
    // Delete-returning is a single statement, so a code cannot be redeemed twice.
    const { data, error } = await serviceClient()
      .from(CODES)
      .delete()
      .eq("code", code)
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data || ms(data.expires_at) < Date.now()) return null;
    const [sat, srt] = await Promise.all([
      decryptSecret(data.supabase_access_token),
      decryptSecret(data.supabase_refresh_token),
    ]);
    return {
      code: data.code,
      client_id: data.client_id,
      redirect_uri: data.redirect_uri,
      code_challenge: data.code_challenge,
      scope: data.scope,
      user_id: data.user_id,
      supabase_access_token: sat,
      supabase_refresh_token: srt,
      expires_at: ms(data.expires_at),
    };
  }

  async saveGrant(grant: Grant): Promise<void> {
    const [accessHash, refreshHash, accessEnc, refreshEnc, sat, srt] = await Promise.all([
      sha256Hex(grant.access_token),
      sha256Hex(grant.refresh_token),
      encryptSecret(grant.access_token),
      encryptSecret(grant.refresh_token),
      encryptSecret(grant.supabase_access_token),
      encryptSecret(grant.supabase_refresh_token),
    ]);
    const { error } = await serviceClient()
      .from(GRANTS)
      .upsert(
        {
          connection_id: grant.connection_id,
          access_token_hash: accessHash,
          refresh_token_hash: refreshHash,
          access_token_enc: accessEnc,
          refresh_token_enc: refreshEnc,
          client_id: grant.client_id,
          client_name: grant.client_name ?? null,
          scope: grant.scope,
          user_id: grant.user_id,
          supabase_access_token: sat,
          supabase_refresh_token: srt,
          status: grant.status,
          created_at: iso(grant.created_at),
          last_used_at: grant.last_used_at ? iso(grant.last_used_at) : null,
          expires_at: iso(grant.expires_at),
        },
        { onConflict: "connection_id" },
      );
    if (error) throw new Error(error.message);
  }

  private async grantByHash(column: string, token: string): Promise<GrantRow | null> {
    const hash = await sha256Hex(token);
    const { data, error } = await serviceClient()
      .from(GRANTS)
      .select(GRANT_COLUMNS)
      .eq(column, hash)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as unknown as GrantRow) ?? null;
  }

  async getGrantByAccessToken(token: string): Promise<Grant | null> {
    const row = await this.grantByHash("access_token_hash", token);
    if (!row || row.status !== "active" || ms(row.expires_at) < Date.now()) return null;
    return rowToGrant(row);
  }

  async getGrantByRefreshToken(token: string): Promise<Grant | null> {
    const row = await this.grantByHash("refresh_token_hash", token);
    if (!row || row.status !== "active") return null;
    return rowToGrant(row);
  }

  async rotateTokens(
    connectionId: string,
    next: { access_token: string; refresh_token: string; expires_at: number },
  ): Promise<Grant | null> {
    const [accessHash, refreshHash, accessEnc, refreshEnc] = await Promise.all([
      sha256Hex(next.access_token),
      sha256Hex(next.refresh_token),
      encryptSecret(next.access_token),
      encryptSecret(next.refresh_token),
    ]);
    const { data, error } = await serviceClient()
      .from(GRANTS)
      .update({
        access_token_hash: accessHash,
        refresh_token_hash: refreshHash,
        access_token_enc: accessEnc,
        refresh_token_enc: refreshEnc,
        expires_at: iso(next.expires_at),
        last_used_at: iso(Date.now()),
      })
      .eq("connection_id", connectionId)
      .eq("status", "active")
      .select(GRANT_COLUMNS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return rowToGrant(data as unknown as GrantRow);
  }

  async touchLastUsed(token: string): Promise<void> {
    const hash = await sha256Hex(token);
    const { error } = await serviceClient()
      .from(GRANTS)
      .update({ last_used_at: iso(Date.now()) })
      .eq("access_token_hash", hash);
    if (error) throw new Error(error.message);
  }

  async listConnectionsByUser(userId: string): Promise<ConnectionView[]> {
    const { data, error } = await serviceClient()
      .from(GRANTS)
      .select("connection_id, client_name, scope, status, created_at, last_used_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((g) => ({
      connection_id: g.connection_id,
      client_name: g.client_name || "AI assistant",
      scopes: String(g.scope ?? "")
        .split(" ")
        .filter(Boolean),
      status: g.status,
      created_at: ms(g.created_at),
      last_used_at: g.last_used_at ? ms(g.last_used_at) : null,
    }));
  }

  async revokeConnection(connectionId: string, userId: string): Promise<boolean> {
    const { data, error } = await serviceClient()
      .from(GRANTS)
      .update({ status: "revoked", revoked_at: iso(Date.now()) })
      .eq("connection_id", connectionId)
      .eq("user_id", userId)
      .select("connection_id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return Boolean(data);
  }

  async updateParentTokens(
    connectionId: string,
    supabaseAccessToken: string,
    supabaseRefreshToken: string,
  ): Promise<void> {
    const [sat, srt] = await Promise.all([
      encryptSecret(supabaseAccessToken),
      encryptSecret(supabaseRefreshToken),
    ]);
    const { error } = await serviceClient()
      .from(GRANTS)
      .update({ supabase_access_token: sat, supabase_refresh_token: srt })
      .eq("connection_id", connectionId);
    if (error) throw new Error(error.message);
  }
}

/** True when the durable store can run: a usable privileged client (scoped
 * oauth_store key + anon, or service role) plus the at-rest encryption key. */
export function hasDurableOAuthStore(): boolean {
  return hasServiceRole() && (process.env.OAUTH_ENC_KEY ?? "").length > 0;
}

export function createSupabaseOAuthStore(): OAuthStore {
  return new SupabaseOAuthStore();
}
