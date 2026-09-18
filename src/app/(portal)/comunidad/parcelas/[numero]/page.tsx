import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";

const ESTADO_LABEL: Record<string, string> = {
  sin_construir: "Sin construir",
  en_construccion: "En construcción",
  construida: "Construida",
};

export default async function PaginaDetalleParcela({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const supabase = await crearClienteServidor();

  const { data: parcela } = await supabase
    .from("parcelas")
    .select("id, numero, estado_construccion")
    .eq("numero", numero)
    .maybeSingle();

  if (!parcela) notFound();

  const { data: vinculos } = await supabase
    .from("propietario_parcela")
    .select("usuario_id")
    .eq("parcela_id", parcela.id)
    .eq("estado", "aprobado");

  const usuarioIds = (vinculos ?? []).map((v) => v.usuario_id);

  const { data: perfiles } = usuarioIds.length
    ? await supabase
        .from("perfiles")
        .select("usuario_id, nombre, apellidos, foto_url, whatsapp, directorio_campos")
        .in("usuario_id", usuarioIds)
        .eq("compartir_en_directorio", true)
    : { data: [] as any[] };

  const habitada = usuarioIds.length > 0;
  const vecinosVisibles = perfiles ?? [];

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <Link
        href="/comunidad/mapa"
        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-bosque-500 px-4 py-2 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
      >
        ← Volver al mapa
      </Link>

      <h1 className="text-xl font-semibold text-bosque-900">Parcela N.° {parcela.numero}</h1>

      <div className="tarjeta flex flex-col gap-2 p-4 text-sm text-bosque-700">
        <p>Estado: {ESTADO_LABEL[parcela.estado_construccion] ?? parcela.estado_construccion}</p>
        <p>{habitada ? "Vinculada a un propietario" : "Sin propietario vinculado todavía"}</p>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">Vecino</p>

        {!habitada && (
          <div className="tarjeta p-4 text-sm text-bosque-500">
            Esta parcela todavía no tiene una solicitud de vinculación aprobada.
          </div>
        )}

        {habitada && vecinosVisibles.length === 0 && (
          <div className="tarjeta p-4 text-sm text-bosque-500">
            Esta parcela está vinculada a un propietario, pero esa persona no ha compartido
            sus datos en el directorio de vecinos.
          </div>
        )}

        {vecinosVisibles.map((v) => {
          const nombreCompleto = [v.nombre, v.apellidos].filter(Boolean).join(" ") || "Vecino";
          const campos = v.directorio_campos ?? {};
          const mostrarWhatsapp = campos.whatsapp && v.whatsapp;

          return (
            <div key={v.usuario_id} className="tarjeta mb-2 flex items-center gap-3 p-4">
              {v.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.foto_url}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bosque-300 text-lg font-medium text-bosque-900">
                  {nombreCompleto[0] ?? "?"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-bosque-900">{nombreCompleto}</p>
                {mostrarWhatsapp && (
                  <a
                    href={`https://wa.me/${v.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center rounded-full bg-bosque-700 px-3 py-1.5 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
                  >
                    Escribir por WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
