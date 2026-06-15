import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Paths reachable without signing in. Everything else (including the root) is
 * the signed-in app and bounces to /auth. `/connect` stays public so the BYO-AI
 * connector setup + its OAuth consent (which does its own sign-in handoff) work.
 */
const PUBLIC_PREFIXES = ["/auth", "/demo", "/connect"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Supabase magic-link auth codes are UUIDs (distinct from affiliate `?code=` slugs). */
const AUTH_CODE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Go-live route guard. The root domain IS the app: an unauthenticated request to
 * any non-public path is redirected to /auth (carrying a `next` so sign-in
 * returns there). Auth is enforced ONLY when Supabase is configured; without
 * credentials (CI / local mock) this passes through so the app stays open.
 */
export async function middleware(request: NextRequest) {
  // Magic-link safety net: if Supabase's Site URL drops the auth code on our app
  // root (or anywhere but the callback), forward it to /auth/callback to be
  // exchanged. UUID-only so it never hijacks an affiliate `?code=` slug.
  const { pathname, search } = request.nextUrl;
  const codeParam = request.nextUrl.searchParams.get("code");
  if (codeParam && AUTH_CODE_RE.test(codeParam) && pathname !== "/auth/callback") {
    const cb = request.nextUrl.clone();
    cb.pathname = "/auth/callback";
    cb.search = "";
    cb.searchParams.set("code", codeParam);
    if (pathname !== "/") cb.searchParams.set("next", pathname);
    return NextResponse.redirect(cb);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next();

  const response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return response;

  // Unauthenticated: allow the public pages, bounce everything else to /auth.
  if (isPublic(pathname)) return response;

  const redirect = request.nextUrl.clone();
  redirect.pathname = "/auth";
  redirect.search = "";
  // Preserve the intended destination (except the bare root, which lands on the
  // app home after sign-in by default).
  if (pathname !== "/") redirect.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(redirect);
}

export const config = {
  // Run on every page route; skip API routes, Next internals, and any path with
  // a dot (static assets, the PWA service worker, manifest, icons, .well-known).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
