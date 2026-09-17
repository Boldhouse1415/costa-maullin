import { crearClienteServidor } from "@/lib/supabase/server";
import { FormularioReporte } from "@/components/ui/FormularioReporte";

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  recibido: { texto: "Recibido", clase: "bg-arena-300 text-bosque-900" },
  en_revision: { texto: "En revisión", clase: "bg-amarillo-semaforo/25 text-bosque-900" },
  en_proceso: { texto: "En proceso", clase: "bg-amarillo-semaforo/40 text-bosque-900" },
  resuelto: { texto: "Resuelto", clase: "bg-bosque-500 text-arena-100" },
  cerrado: { texto: "Cerrado", clase: "bg-bosque-900 text-arena-100" },
};

export default async function PaginaReportar() {
  const supabase = await crearClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: misReportes } = user
    ? await supabase
        .from("reportes")
        .select("id, categoria, comentario, estado, created_at, foto_urls")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] as any[] };

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <h1 className="text-xl font-semibold text-bosque-900">Reportar</h1>
      <p className="text-sm text-bosque-500">
        Reporta una situación con foto, audio o comentario, directamente desde tu teléfono.
      </p>

      <FormularioReporte />

      {misReportes && misReportes.length > 0 && (
        <div>
          <p className="mb-2 mt-2 text-xs uppercase tracking-wide text-bosque-500">
            Mis reportes
          </p>
          <div className="flex flex-col gap-3">
            {misReportes.map((r) => {
              const estado = ESTADOS[r.estado] ?? ESTADOS.recibido;
              return (
                <div key={r.id} className="tarjeta flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-medium text-bosque-900">{r.categoria}</h2>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.clase}`}>
                      {estado.texto}
                    </span>
                  </div>
                  {r.comentario && <p className="text-sm text-bosque-700">{r.comentario}</p>}
                  {r.foto_urls && r.foto_urls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {r.foto_urls.map((url: string) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={url}
                          alt=""
                          className="h-20 w-20 shrink-0 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-bosque-500">
                    {new Date(r.created_at).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
