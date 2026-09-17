import { crearClienteServidor } from "@/lib/supabase/server";
import { Icono } from "@/components/ui/Icono";

const ESTADO_CONSTRUCCION: Record<string, string> = {
  sin_construir: "Sin construir",
  en_construccion: "En construcción",
  construida: "Construida",
};

export default async function PaginaMiParcela() {
  const supabase = await crearClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vinculos } = user
    ? await supabase
        .from("propietario_parcela")
        .select(
          "parcelas(id, numero, estado_construccion, medidor_electrico, numero_medidor_electrico, medidor_agua, numero_medidor_agua, poste_electrico, empalme_electrico, conexion_agua, fecha_construccion, observaciones, foto_principal_url)",
        )
        .eq("usuario_id", user.id)
        .eq("estado", "aprobado")
    : { data: [] as any[] };

  const parcelas = (vinculos ?? []).map((v: any) => v.parcelas).filter(Boolean);

  if (parcelas.length === 0) {
    return (
      <div className="flex flex-col gap-4 px-5 py-8">
        <h1 className="text-xl font-semibold text-bosque-900">Mi Parcela</h1>
        <div className="tarjeta flex flex-col items-center gap-3 p-8 text-center text-bosque-500">
          <Icono nombre="parcela" className="h-8 w-8 text-bosque-500" />
          <p className="text-sm">Todavía no tienes una parcela vinculada aprobada.</p>
          <a
            href="/onboarding"
            className="flex items-center justify-center gap-2 rounded-full bg-bosque-700 px-4 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
          >
            Inscribe tu parcela aquí
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <h1 className="text-xl font-semibold text-bosque-900">Mi Parcela</h1>

      {parcelas.map((p: any) => (
        <div key={p.id} className="tarjeta flex flex-col gap-3 p-4">
          {p.foto_principal_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.foto_principal_url}
              alt={`Parcela ${p.numero}`}
              className="h-40 w-full rounded-xl object-cover"
            />
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-bosque-900">Parcela {p.numero}</h2>
            <span className="rounded-full bg-bosque-300/50 px-2.5 py-0.5 text-xs font-medium text-bosque-900">
              {ESTADO_CONSTRUCCION[p.estado_construccion] ?? p.estado_construccion}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-arena-300">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-bosque-500">Medidor eléctrico</span>
              <span className="text-bosque-900">
                {p.medidor_electrico ? p.numero_medidor_electrico || "Sí" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-bosque-500">Medidor de agua</span>
              <span className="text-bosque-900">
                {p.medidor_agua ? p.numero_medidor_agua || "Sí" : "No"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-bosque-500">Poste eléctrico</span>
              <span className="text-bosque-900">{p.poste_electrico ? "Sí" : "No"}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-bosque-500">Empalme eléctrico</span>
              <span className="text-bosque-900">{p.empalme_electrico ? "Sí" : "No"}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-bosque-500">Conexión de agua</span>
              <span className="text-bosque-900">{p.conexion_agua ? "Sí" : "No"}</span>
            </div>
            {p.fecha_construccion && (
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-bosque-500">Fecha de construcción</span>
                <span className="text-bosque-900">
                  {new Date(p.fecha_construccion).toLocaleDateString("es-CL")}
                </span>
              </div>
            )}
          </div>

          {p.observaciones && (
            <p className="text-sm text-bosque-500">{p.observaciones}</p>
          )}

          <a
            href={`/comunidad/parcelas/${p.numero}`}
            className="text-center text-sm font-medium text-bosque-700 underline"
          >
            Ver en el mapa de la comunidad
          </a>
        </div>
      ))}
    </div>
  );
}
