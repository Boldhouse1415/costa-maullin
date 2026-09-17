import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { Icono } from "@/components/ui/Icono";
import { FormularioDocumento } from "@/components/ui/FormularioDocumento";

export default async function PaginaDocumentos() {
  const usuario = await obtenerUsuarioActual();
  const puedeGestionar = tienePermiso(usuario, "comunidad.gestionar_documentos");

  const supabase = await crearClienteServidor();

  const [{ data: documentos }, categoriasData] = await Promise.all([
    supabase
      .from("documentos")
      .select("id, nombre, descripcion, fecha, archivo_url, categorias_documento(nombre)")
      .order("fecha", { ascending: false }),
    puedeGestionar
      ? supabase.from("categorias_documento").select("id, nombre").order("nombre")
      : Promise.resolve({ data: [] as { id: string; nombre: string }[] }),
  ]);
  const categorias = categoriasData.data;

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-bosque-900">Documentos</h1>
        {puedeGestionar && <FormularioDocumento categorias={categorias ?? []} />}
      </div>
      <p className="text-sm text-bosque-500">
        Actas, reglamentos, planos y otros documentos de la comunidad.
      </p>

      {documentos && documentos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {documentos.map((d) => (
            <a
              key={d.id}
              href={d.archivo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="tarjeta flex items-center gap-3 p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bosque-500 text-arena-100">
                <Icono nombre="documentos" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-bosque-900">{d.nombre}</p>
                <p className="text-xs text-bosque-500">
                  {(d.categorias_documento as any)?.nombre ?? "Documento"} ·{" "}
                  {new Date(d.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                {d.descripcion && <p className="text-sm text-bosque-500">{d.descripcion}</p>}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
          <Icono nombre="documentos" className="h-8 w-8 text-bosque-500" />
          <p className="text-sm">Todavía no hay documentos publicados.</p>
        </div>
      )}
    </div>
  );
}
