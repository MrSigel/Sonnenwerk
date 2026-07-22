import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Session-Refresh + Zugriffsschutz für /admin (§17.4).
 * - Öffentliche Admin-Routen: /admin/login, /admin/registrieren.
 * - Alle übrigen /admin-Seiten erfordern eine gültige Session → sonst Redirect
 *   auf /admin/login.
 * - Bei fehlender Supabase-ENV wird nicht geschützt geblockt: die Login-Seite
 *   zeigt dann einen Hinweis (kein Crash).
 */

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/registrieren"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ENV fehlt → Session-Handling nicht möglich. Login-Seite bleibt erreichbar,
  // andere Admin-Seiten leiten dorthin um.
  if (!url || !anon) {
    if (!PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  // Bereits eingeloggt und ruft Login/Registrierung auf → ins Dashboard.
  if (user && isPublic) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
