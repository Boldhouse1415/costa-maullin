import { crearClienteServidor } from "@/lib/supabase/server";
import { TarjetaResumen } from "@/components/ui/TarjetaResumen";
import { Icono } from "@/components/ui/Icono";

export default async function PaginaInicio() {
  const supabase = await crearClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = user
    ? await supabase
        .from("perfiles")
        .select("nombre, foto_url")
        .eq("usuario_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: vinculos } = user
    ? await supabase
        .from("propietario_parcela")
        .select("estado, parcelas(numero)")
        .eq("usuario_id", user.id)
        .eq("estado", "aprobado")
    : { data: [] as any[] };

  const { data: configEstado } = await supabase
    .from("configuracion")
    .select("valor")
    .eq("clave", "estado_general")
    .maybeSingle();

  const estadoGeneral = (configEstado?.valor as any) ?? {
    nivel: "verde",
    titulo: "Todo normal",
  };

  const { data: proximoEvento } = await supabase
    .from("eventos")
    .select("titulo, fecha, hora")
    .gte("fecha", new Date().toISOString().slice(0, 10))
    .order("fecha", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: avisoDestacado } = await supabase
    .from("avisos")
    .select("titulo, texto")
    .order("fecha", { ascending: false })
    .limit(1)
    .maybeSingle();

  const primeraParcela = vinculos?.[0]?.parcelas as any;
  const nombre = perfil?.nombre ?? "";

  const tonoEstado: "verde" | "amarillo" | "rojo" =
    estadoGeneral.nivel === "rojo" ? "rojo" : estadoGeneral.nivel === "amarillo" ? "amarillo" : "verde";

  return (
    <div className="flex flex-col">
      {/* Hero panorámico con la fotografía real de Costa Maullín. */}
      <div
        className="relative flex h-56 items-end bg-cover bg-center px-5 pb-5"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(22,38,31,0.15) 0%, rgba(22,38,31,0.9) 100%), url(/costa-maullin-referencial.png)",
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-arena-200">Costa Maullín</p>
          <h1 className="text-2xl font-semibold text-arena-100">
            Hola{nombre ? `, ${nombre}` : ""}
          </h1>
          {primeraParcela && (
            <p className="text-sm text-arena-200">Parcela {primeraParcela.numero}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
        {!primeraParcela && (
          <div className="tarjeta p-4 text-sm text-bosque-700">
            Aún no tienes una parcela vinculada aprobada.{" "}
            <a href="/onboarding" className="underline">
              Completa tu solicitud aquí
            </a>
            .
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <TarjetaResumen titulo="Clima · Maullín" valor="—" detalle="Próximamente" />
          <TarjetaResumen
            titulo="Estado Costa Maullín"
            valor={estadoGeneral.titulo}
            tono={tonoEstado}
          />
        </div>

        <TarjetaResumen
          titulo="Próximo evento"
          valor={proximoEvento ? proximoEvento.titulo : "Sin eventos programados"}
          detalle={
            proximoEvento
              ? `${new Date(proximoEvento.fecha).toLocaleDateString("es-CL", {
                  day: "numeric",
                  month: "long",
                })}${proximoEvento.hora ? " · " + proximoEvento.hora : ""}`
              : "No hay próximos eventos."
          }
        />

        {avisoDestacado && (
          <TarjetaResumen titulo="Aviso" valor={avisoDestacado.titulo} detalle={avisoDestacado.texto} />
        )}

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">
            Accesos rápidos
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: "/mi-parcela", label: "Mi Parcela", icono: "parcela" as const },
              { href: "/comunidad/mapa", label: "Mapa", icono: "mapa" as const },
              { href: "/pagos", label: "Mis Pagos", icono: "pagos" as const },
              { href: "/calendario", label: "Calendario", icono: "calendario" as const },
              { href: "/comunidad", label: "Documentos", icono: "documentos" as const },
              { href: "/comunidad/acceso", label: "Acceso", icono: "acceso" as const },
              { href: "/comunidad/contactos", label: "Contactos", icono: "contactos" as const },
            ].map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="tarjeta flex flex-col items-center gap-1.5 p-3 text-center text-xs text-bosque-700"
              >
                <Icono nombre={a.icono} className="h-6 w-6 text-bosque-700" />
                {a.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
