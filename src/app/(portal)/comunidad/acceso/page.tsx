import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { BotonCopiar } from "@/components/ui/BotonCopiar";
import { Icono } from "@/components/ui/Icono";

export default async function PaginaAcceso() {
  const usuario = await obtenerUsuarioActual();
  const puedeVerClave = tienePermiso(usuario, "accesos.ver_clave");

  const supabase = await crearClienteServidor();

  const { data: ubicacionConfig } = await supabase
    .from("configuracion")
    .select("valor")
    .eq("clave", "ubicacion")
    .maybeSingle();

  const direccion = (ubicacionConfig?.valor as any)?.direccion as string | undefined;

  let clave: string | null = null;
  if (puedeVerClave) {
    const { data: acceso } = await supabase
      .from("accesos")
      .select("clave_actual")
      .maybeSingle();
    clave = acceso?.clave_actual ?? null;
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <h1 className="text-xl font-semibold text-bosque-900">Acceso Costa Maullín</h1>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">
          Clave del candado
        </p>
        {puedeVerClave ? (
          clave ? (
            <div className="tarjeta flex items-center justify-between p-4">
              <span className="text-2xl font-semibold tracking-[0.3em] text-bosque-900">
                {clave}
              </span>
              <BotonCopiar valor={clave} />
            </div>
          ) : (
            <div className="tarjeta p-4 text-sm text-bosque-500">
              Todavía no se ha registrado una clave.
            </div>
          )
        ) : (
          <div className="tarjeta p-4 text-sm text-bosque-500">
            Solicita la clave del candado a administración.
          </div>
        )}
      </div>

      {direccion && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">Ubicación</p>
          <div className="tarjeta flex flex-col gap-3 p-4">
            <p className="text-sm text-bosque-700">{direccion}</p>
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
              >
                <Icono nombre="mapa" className="h-4 w-4" />
                Google Maps
              </a>
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(direccion)}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-arena-300 py-2.5 text-sm font-medium text-bosque-700 transition hover:bg-arena-200"
              >
                <Icono nombre="mapa" className="h-4 w-4" />
                Waze
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
