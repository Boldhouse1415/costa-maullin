import { crearClienteServidor } from "@/lib/supabase/server";

export default async function PaginaPerfil() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = user
    ? await supabase
        .from("perfiles")
        .select("nombre, apellidos, telefono, whatsapp, foto_url")
        .eq("usuario_id", user.id)
        .maybeSingle()
    : { data: null };

  async function cerrarSesion() {
    "use server";
    const supabase = await crearClienteServidor();
    await supabase.auth.signOut();
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <h1 className="text-xl font-semibold text-bosque-900">Mi Perfil</h1>

      <div className="tarjeta flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bosque-300 text-lg font-medium text-bosque-900">
          {perfil?.nombre?.[0] ?? "?"}
        </div>
        <div>
          <p className="font-medium text-bosque-900">
            {perfil?.nombre ?? "Sin nombre"} {perfil?.apellidos ?? ""}
          </p>
          <p className="text-sm text-bosque-500">{user?.email}</p>
        </div>
      </div>

      <div className="tarjeta flex flex-col gap-2 p-4 text-sm text-bosque-700">
        <p>Teléfono: {perfil?.telefono ?? "—"}</p>
        <p>WhatsApp: {perfil?.whatsapp ?? "—"}</p>
      </div>

      <form action={cerrarSesion}>
        <button
          type="submit"
          className="h-12 w-full rounded-full border border-arena-300 font-medium text-bosque-700 transition hover:bg-arena-200"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
