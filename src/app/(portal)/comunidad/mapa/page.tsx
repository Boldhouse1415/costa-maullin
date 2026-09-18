import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";

export default async function PaginaMapaParcelas() {
  const supabase = await crearClienteServidor();

  const { data: parcelas } = await supabase
    .from("parcelas")
    .select("id, numero, estado_construccion");

  const { data: vinculos } = await supabase
    .from("propietario_parcela")
    .select("parcela_id, usuario_id")
    .eq("estado", "aprobado");

  const usuarioPorParcela = new Map<string, string>();
  for (const v of vinculos ?? []) {
    if (!usuarioPorParcela.has(v.parcela_id)) usuarioPorParcela.set(v.parcela_id, v.usuario_id);
  }

  const usuarioIds = Array.from(new Set(Array.from(usuarioPorParcela.values())));

  const { data: perfiles } = usuarioIds.length
    ? await supabase
        .from("perfiles")
        .select("usuario_id, nombre, foto_url")
        .in("usuario_id", usuarioIds)
        .eq("compartir_en_directorio", true)
    : { data: [] as any[] };

  const perfilPorUsuario = new Map((perfiles ?? []).map((p: any) => [p.usuario_id, p]));

  const ocupadas = new Set(usuarioPorParcela.keys());

  const lista = (parcelas ?? []).slice().sort((a, b) => {
    const na = parseInt(a.numero, 10);
    const nb = parseInt(b.numero, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.numero.localeCompare(b.numero);
  });

  const totalOcupadas = lista.filter((p) => ocupadas.has(p.id)).length;

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <div>
        <h1 className="text-xl font-semibold text-bosque-900">Mapa de parcelas</h1>
        <p className="text-sm text-bosque-500">
          {totalOcupadas} de {lista.length} parcelas vinculadas a un propietario. Toca una
          parcela para ver su detalle.
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs text-bosque-500">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-bosque-700" />
          Habitada / vinculada
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-arena-300 bg-arena-100" />
          Disponible
        </div>
      </div>

      <div className="tarjeta grid grid-cols-4 gap-1 p-3 sm:grid-cols-6">
        {lista.map((p) => {
          const usuarioId = usuarioPorParcela.get(p.id);
          const perfil: any = usuarioId ? perfilPorUsuario.get(usuarioId) : undefined;
          const habitada = ocupadas.has(p.id);
          const primerNombre = perfil?.nombre?.split(" ")[0];

          return (
            <Link
              key={p.id}
              href={`/comunidad/parcelas/${encodeURIComponent(p.numero)}`}
              className="flex flex-col items-center gap-1 rounded-2xl p-1.5 text-center transition hover:bg-arena-200"
            >
              {perfil?.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={perfil.foto_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-bosque-500/40"
                />
              ) : (
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-medium ${
                    habitada
                      ? "bg-bosque-700 text-arena-100"
                      : "border border-arena-300 bg-arena-100 text-bosque-500"
                  }`}
                >
                  {p.numero}
                </div>
              )}
              <p className="w-full truncate text-[10px] font-medium text-bosque-900">
                {primerNombre ?? `N.° ${p.numero}`}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
