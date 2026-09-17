import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para usar en componentes de cliente ("use client").
 * Lee las variables públicas (seguras de exponer) del entorno.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
