import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { Icono } from "@/components/ui/Icono";
import { FormularioNoticia } from "@/components/ui/FormularioNoticia";
import { GestionNoticia } from "@/components/ui/GestionNoticia";

export default async function PaginaNoticias() {
  const usuario = await obtenerUsuarioActual();
  const puedePublicar = tienePermiso(usuario, "comunidad.gestionar_avisos");

  const supabase = await crearClienteServidor();

  const { data: avisos } = await supabase
    .from("avisos")
    .select("id, titulo, texto, fecha, importancia, foto_url")
    .order("fecha", { ascending: false });

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-bosque-900">Noticias</h1>
        {puedePublicar && <FormularioNoticia />}
      </div>
      <p className="text-sm text-bosque-500">
        Avisos y novedades de interés para toda la comunidad.
      </p>

      {avisos && avisos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {avisos.map((a) => (
            <div key={a.id} className="tarjeta flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-medium text-bosque-900">{a.titulo}</h2>
                {a.importancia === "alta" && (
                  <span className="shrink-0 rounded-full bg-amarillo-semaforo/25 px-2.5 py-0.5 text-xs font-medium text-bosque-900">
                    Importante
                  </span>
                )}
              </div>
              <p className="whitespace-pre-line text-sm text-bosque-700">{a.texto}</p>
              {a.foto_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.foto_url}
                  alt=""
                  className="mt-1 max-h-64 w-full rounded-xl object-cover"
                />
              )}
              <p className="text-xs text-bosque-500">
                {new Date(a.fecha).toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {puedePublicar && (
                <div className="mt-1">
                  <GestionNoticia aviso={a} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
          <Icono nombre="noticias" className="h-8 w-8 text-bosque-500" />
          <p className="text-sm">Todavía no hay noticias publicadas.</p>
        </div>
      )}
    </div>
  );
}
