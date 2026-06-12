import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Route guard for the signed-in app. Auth is enforced ONLY when Supabase is
 * configured; without credentials (CI / local mock) this passes through so the
 * app stays open. When configured, an unauthenticated request to a protected
 * path is redirected to /auth.
 */
export async function middleware(request: NextRequest) {
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

  if (!user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/auth";
    return NextResponse.redirect(redirect);
  }
  return response;
}

export const config = {
  matcher: ["/trips/:path*", "/profiles/:path*", "/account/:path*"],
};
