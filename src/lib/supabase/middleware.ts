import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada request y protege las rutas
 * privadas del portal, redirigiendo a /login cuando no hay sesión.
 */
export async function actualizarSesion(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rutaPrivada =
    request.nextUrl.pathname.startsWith("/inicio") ||
    request.nextUrl.pathname.startsWith("/mi-parcela") ||
    request.nextUrl.pathname.startsWith("/pagos") ||
    request.nextUrl.pathname.startsWith("/calendario") ||
    request.nextUrl.pathname.startsWith("/reportar") ||
    request.nextUrl.pathname.startsWith("/comunidad") ||
    request.nextUrl.pathname.startsWith("/perfil") ||
    request.nextUrl.pathname.startsWith("/onboarding");

  if (!user && rutaPrivada) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
