import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { FormularioEncuesta } from "@/components/ui/FormularioEncuesta";
import { Icono } from "@/components/ui/Icono";

export default async function PaginaVotaciones() {
  const usuario = await obtenerUsuarioActual();
  const puedeGestionar = tienePermiso(usuario, "comunidad.gestionar_encuestas");

  const supabase = await crearClienteServidor();

  const { data: encuestas } = await supabase
    .from("encuestas")
    .select("id, titulo, descripcion, estado, fecha_cierre, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-bosque-900">Votaciones y encuestas</h1>
          <p className="text-sm text-bosque-500">Decisiones comunitarias con resultados transparentes.</p>
        </div>
      </div>

      {puedeGestionar && <FormularioEncuesta />}

      {encuestas && encuestas.length > 0 ? (
        <div className="flex flex-col gap-3">
          {encuestas.map((e) => (
            <Link
              key={e.id}
              href={`/comunidad/votaciones/${e.id}`}
              className="tarjeta flex items-center gap-3 p-4 transition hover:bg-arena-200"
            >
              <div className="flex-1">
                <p className="font-medium text-bosque-900">{e.titulo}</p>
                {e.descripcion && <p className="text-sm text-bosque-500">{e.descripcion}</p>}
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      e.estado === "abierta"
                        ? "bg-bosque-500 text-arena-100"
                        : "bg-arena-300 text-bosque-900"
                    }`}
                  >
                    {e.estado === "abierta" ? "Abierta" : "Cerrada"}
                  </span>
                  {e.fecha_cierre && (
                    <span className="text-xs text-bosque-500">
                      Cierra{" "}
                      {new Date(e.fecha_cierre).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  )}
                </div>
              </div>
              <Icono nombre="flecha" className="h-5 w-5 shrink-0 text-bosque-300" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
          <Icono nombre="votaciones" className="h-8 w-8 text-bosque-500" />
          <p className="text-sm">Todavía no hay votaciones creadas.</p>
        </div>
      )}
    </div>
  );
}
