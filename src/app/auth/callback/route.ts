import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";

// Recibe el código de OAuth (Google) o del link de verificación de email,
// lo intercambia por una sesión, y redirige al onboarding o al Home.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
