import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { VotoEncuesta } from "@/components/ui/VotoEncuesta";
import { Icono } from "@/components/ui/Icono";

export default async function PaginaDetalleEncuesta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await obtenerUsuarioActual();
  const puedeGestionar = tienePermiso(usuario, "comunidad.gestionar_encuestas");

  const supabase = await crearClienteServidor();

  const { data: encuesta } = await supabase
    .from("encuestas")
    .select("id, titulo, descripcion, estado, fecha_cierre")
    .eq("id", id)
    .maybeSingle();

  if (!encuesta) notFound();

  const [{ data: opciones }, { data: resultados }, { data: miVoto }] = await Promise.all([
    supabase.from("encuesta_opciones").select("id, texto").eq("encuesta_id", id).order("orden"),
    supabase.rpc("resultados_encuesta", { p_encuesta_id: id }),
    usuario
      ? supabase
          .from("encuesta_votos")
          .select("opcion_id")
          .eq("encuesta_id", id)
          .eq("usuario_id", usuario.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const totalVotos = (resultados ?? []).reduce((acc: number, r: any) => acc + Number(r.votos), 0);

  async function cerrarVotacion() {
    "use server";
    const supabase = await crearClienteServidor();
    await supabase.from("encuestas").update({ estado: "cerrada" }).eq("id", id);
    revalidatePath(`/comunidad/votaciones/${id}`);
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <Link
        href="/comunidad/votaciones"
        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-bosque-500 px-4 py-2 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
      >
        ← Volver a votaciones
      </Link>

      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-bosque-900">{encuesta.titulo}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              encuesta.estado === "abierta"
                ? "bg-bosque-500 text-arena-100"
                : "bg-arena-300 text-bosque-900"
            }`}
          >
            {encuesta.estado === "abierta" ? "Abierta" : "Cerrada"}
          </span>
        </div>
        {encuesta.descripcion && <p className="mt-1 text-sm text-bosque-500">{encuesta.descripcion}</p>}
      </div>

      {encuesta.estado === "abierta" && opciones && opciones.length > 0 && (
        <VotoEncuesta
          encuestaId={encuesta.id}
          opciones={opciones}
          votoActualId={(miVoto as any)?.opcion_id ?? null}
        />
      )}

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">
          Resultados ({totalVotos} {totalVotos === 1 ? "voto" : "votos"})
        </p>
        <div className="tarjeta flex flex-col gap-3 p-4">
          {(resultados ?? []).map((r: any) => {
            const porcentaje = totalVotos > 0 ? Math.round((Number(r.votos) / totalVotos) * 100) : 0;
            return (
              <div key={r.opcion_id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-bosque-900">{r.texto}</p>
                  <p className="text-bosque-500">
                    {r.votos} · {porcentaje}%
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-arena-200">
                  <div
                    className="h-full rounded-full bg-bosque-700"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {puedeGestionar && encuesta.estado === "abierta" && (
        <form action={cerrarVotacion}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-rojo-semaforo py-2.5 text-sm font-medium text-arena-100 transition hover:opacity-90"
          >
            <Icono nombre="check" className="h-4 w-4" />
            Cerrar votación
          </button>
        </form>
      )}
    </div>
  );
}
