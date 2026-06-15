import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safeNext";

/**
 * Magic-link callback. Supabase emails a PKCE link that lands here with a
 * `?code=`; we exchange it for a session (sets the auth cookies) and send the
 * parent into the app. Pairs with the 6-digit OTP path in AuthClient - either
 * way the user ends up signed in.
 */
function originOf(request: Request): string {
  const h = request.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = originOf(request);
  const dest = safeNextPath(url.searchParams.get("next"), origin);

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=missing_code", origin));
  }

  const supabase = await createClient();
  // Mock / unconfigured: nothing to exchange, just continue into the app.
  if (!supabase) return NextResponse.redirect(new URL(dest, origin));

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/auth?error=link_expired", origin));
  }
  // First factor established (AAL1). Route through the second factor so 2FA is
  // enforced however the user signed in; /auth/mfa continues to `dest`.
  const mfa = new URL("/auth/mfa", origin);
  mfa.searchParams.set("next", dest);
  return NextResponse.redirect(mfa);
}
