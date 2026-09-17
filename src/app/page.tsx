import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";

export default async function PaginaRaiz() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/inicio" : "/login");
}
