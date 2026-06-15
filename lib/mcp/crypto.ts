// Token crypto for the durable OAuth store. SERVER-ONLY.
//
// PKCE lives in ./pkce.ts; this is just the at-rest discipline the durable store
// needs: SHA-256 hashing of the opaque tokens we ISSUE (so the row stores only a
// hash and we look up by hash), and AES-GCM encryption of the parent's captured
// Supabase tokens (ciphertext at rest, decrypted only when a tool must act as
// the parent). Uses Web Crypto (Node + edge). See docs/handoffs/MCP-CHANGE-PROTOCOL.md.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function u8(s: string): Uint8Array<ArrayBuffer> {
  const src = encoder.encode(s);
  const out = new Uint8Array(src.length);
  out.set(src);
  return out;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function aesKey(): Promise<CryptoKey> {
  const secret = process.env.OAUTH_ENC_KEY ?? "";
  if (!secret) throw new Error("OAUTH_ENC_KEY not configured.");
  const digest = await crypto.subtle.digest("SHA-256", u8(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

/** Encrypt a secret to `iv.ciphertext` (both base64url). */
export async function encryptSecret(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await aesKey();
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, u8(plaintext)),
  );
  return `${b64urlEncode(iv)}.${b64urlEncode(ct)}`;
}

/** Decrypt an `iv.ciphertext` payload produced by encryptSecret. */
export async function decryptSecret(payload: string): Promise<string> {
  const [ivPart, ctPart] = payload.split(".");
  if (!ivPart || !ctPart) throw new Error("Malformed ciphertext.");
  const key = await aesKey();
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64urlDecode(ivPart) },
    key,
    b64urlDecode(ctPart),
  );
  return decoder.decode(pt);
}

/** SHA-256 hex of a value (store/lookup issued tokens by hash, never in the clear). */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", u8(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
