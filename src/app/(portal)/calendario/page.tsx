import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { Icono } from "@/components/ui/Icono";
import { FormularioEvento } from "@/components/ui/FormularioEvento";

export default async function PaginaCalendario() {
  const usuario = await obtenerUsuarioActual();
  const puedeGestionar = tienePermiso(usuario, "comunidad.gestionar_calendario");

  const supabase = await crearClienteServidor();

  const hoy = new Date().toISOString().slice(0, 10);

  const [{ data: proximos }, { data: pasados }, { data: categorias }] = await Promise.all([
    supabase
      .from("eventos")
      .select("id, titulo, descripcion, fecha, hora, lugar, categorias_evento(nombre)")
      .gte("fecha", hoy)
      .order("fecha", { ascending: true }),
    supabase
      .from("eventos")
      .select("id, titulo, fecha, categorias_evento(nombre)")
      .lt("fecha", hoy)
      .order("fecha", { ascending: false })
      .limit(10),
    supabase.from("categorias_evento").select("id, nombre").order("nombre"),
  ]);

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString("es-CL", {
      weekday: "short",
      day: "numeric",
      month: "long",
    });
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-bosque-900">Calendario</h1>
        {puedeGestionar && <FormularioEvento categorias={categorias ?? []} />}
      </div>
      <p className="text-sm text-bosque-500">
        Eventos, reuniones y mantenciones programadas en Costa Maullín.
      </p>

      {proximos && proximos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {proximos.map((ev) => (
            <div key={ev.id} className="tarjeta flex flex-col gap-1 p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-medium text-bosque-900">{ev.titulo}</h2>
                {(ev.categorias_evento as any)?.nombre && (
                  <span className="shrink-0 rounded-full bg-bosque-300/50 px-2.5 py-0.5 text-xs font-medium text-bosque-900">
                    {(ev.categorias_evento as any).nombre}
                  </span>
                )}
              </div>
              <p className="text-sm text-bosque-700">
                {formatearFecha(ev.fecha)}
                {ev.hora ? ` · ${ev.hora.slice(0, 5)}` : ""}
                {ev.lugar ? ` · ${ev.lugar}` : ""}
              </p>
              {ev.descripcion && <p className="text-sm text-bosque-500">{ev.descripcion}</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
          <Icono nombre="calendario" className="h-8 w-8 text-bosque-500" />
          <p className="text-sm">No hay próximos eventos programados.</p>
        </div>
      )}

      {pasados && pasados.length > 0 && (
        <div>
          <p className="mb-2 mt-2 text-xs uppercase tracking-wide text-bosque-500">
            Eventos pasados
          </p>
          <div className="flex flex-col gap-2">
            {pasados.map((ev) => (
              <div key={ev.id} className="tarjeta flex items-center justify-between p-3 text-sm">
                <span className="text-bosque-700">{ev.titulo}</span>
                <span className="text-bosque-500">{formatearFecha(ev.fecha)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
