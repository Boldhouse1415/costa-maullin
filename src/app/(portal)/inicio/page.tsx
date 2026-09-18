import { crearClienteServidor } from "@/lib/supabase/server";
import { TarjetaResumen } from "@/components/ui/TarjetaResumen";
import { Icono, type NombreIcono } from "@/components/ui/Icono";

// Coordenadas de Maullín, Chile.
const LAT = -41.6167;
const LON = -73.6167;

function climaDesdeCodigo(codigo: number): { icono: NombreIcono; texto: string } {
  if (codigo === 0) return { icono: "sol", texto: "Despejado" };
  if ([1, 2].includes(codigo)) return { icono: "sol", texto: "Parcialmente nublado" };
  if ([3, 45, 48].includes(codigo)) return { icono: "nublado", texto: "Nublado" };
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 71, 73, 75, 77, 85, 86, 95, 96, 99].includes(
      codigo,
    )
  )
    return { icono: "lluvia", texto: "Lluvia" };
  return { icono: "nublado", texto: "Nublado" };
}

async function obtenerClima() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&timezone=America%2FSantiago`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    const codigo = data?.current?.weather_code;
    if (typeof temp !== "number" || typeof codigo !== "number") return null;
    return { temp: Math.round(temp), ...climaDesdeCodigo(codigo) };
  } catch {
    return null;
  }
}

export default async function PaginaInicio() {
  const supabase = await crearClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: perfil },
    { data: vinculos },
    { data: configEstado },
    { data: proximoEvento },
    { data: avisoDestacado },
    { data: contactosEmergencia },
    clima,
  ] = await Promise.all([
      user
        ? supabase.from("perfiles").select("nombre, foto_url").eq("usuario_id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("propietario_parcela")
            .select("estado, parcelas(numero)")
            .eq("usuario_id", user.id)
            .eq("estado", "aprobado")
        : Promise.resolve({ data: [] as any[] }),
      supabase.from("configuracion").select("valor").eq("clave", "estado_general").maybeSingle(),
      supabase
        .from("eventos")
        .select("titulo, fecha, hora")
        .gte("fecha", new Date().toISOString().slice(0, 10))
        .order("fecha", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("avisos").select("titulo, texto").order("fecha", { ascending: false }).limit(1).maybeSingle(),
      supabase
        .from("contactos_utiles")
        .select("nombre, cargo, telefono")
        .in("nombre", ["Bomberos", "Carabineros", "SAMU / Ambulancia"])
        .order("nombre"),
      obtenerClima(),
    ]);

  const estadoGeneral = (configEstado?.valor as any) ?? {
    nivel: "verde",
    titulo: "Todo normal",
  };

  const primeraParcela = vinculos?.[0]?.parcelas as any;
  const nombre = perfil?.nombre ?? "";

  const varianteEstado =
    estadoGeneral.nivel === "rojo" ? "rojo" : estadoGeneral.nivel === "amarillo" ? "amarillo" : "claro";
  const iconoEstado = estadoGeneral.nivel === "verde" || !estadoGeneral.nivel ? "check" : "alerta";

  const accesos: { href: string; label: string; icono: NombreIcono }[] = [
    { href: "/mi-parcela", label: "Mi Parcela", icono: "parcela" },
    { href: "/comunidad/noticias", label: "Noticias", icono: "noticias" },
    { href: "/comunidad/mapa", label: "Mapa", icono: "mapa" },
    { href: "/pagos", label: "Mis Pagos", icono: "pagos" },
    { href: "/calendario", label: "Calendario", icono: "calendario" },
    { href: "/comunidad/documentos", label: "Documentos", icono: "documentos" },
    { href: "/comunidad/acceso", label: "Acceso", icono: "acceso" },
    { href: "/comunidad/tesoreria", label: "Tesorería transparente", icono: "tesoreria" },
    { href: "/comunidad/votaciones", label: "Votaciones", icono: "votaciones" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero panorámico con la fotografía real de Costa Maullín. */}
      <div
        className="relative flex h-56 items-end bg-cover bg-center px-5 pb-5"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(22,38,31,0.15) 0%, rgba(22,38,31,0.9) 100%), url(/costa-maullin-referencial.jpg)",
        }}
      >
        <div className="flex items-center gap-3">
          {perfil?.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={perfil.foto_url}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-arena-100/70"
            />
          ) : null}
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
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
        {!primeraParcela && (
          <div className="tarjeta flex flex-col gap-3 p-4 text-sm text-bosque-700">
            <p>Aún no tienes una parcela vinculada aprobada.</p>
            <a
              href="/onboarding"
              className="flex items-center justify-center gap-2 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
            >
              <Icono nombre="parcela" className="h-4 w-4" />
              Inscribe tu parcela aquí
            </a>
          </div>
        )}

        {contactosEmergencia && contactosEmergencia.length > 0 && (
          <div className="tarjeta flex flex-col gap-2 border border-rojo-semaforo/40 bg-rojo-semaforo/10 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rojo-semaforo">
              <Icono nombre="alerta" className="h-4 w-4" />
              Emergencias
            </p>
            <div className="flex flex-wrap gap-2">
              {contactosEmergencia.map((c: any) => {
                const zona = c.cargo?.includes("Carelmapu") ? " (Carelmapu)" : "";
                const etiqueta = `${c.nombre.split(" / ")[0]}${zona}`;
                return (
                  <a
                    key={`${c.nombre}-${c.cargo}`}
                    href={`tel:${c.telefono.replace(/[^0-9+]/g, "")}`}
                    className="flex-1 rounded-full bg-rojo-semaforo px-3 py-2 text-center text-sm font-medium text-arena-100 transition hover:opacity-90"
                  >
                    {etiqueta} · {c.telefono}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <TarjetaResumen
            titulo="Clima · Maullín"
            valor={clima ? `${clima.temp}°` : "—"}
            detalle={clima ? clima.texto : "No disponible"}
            icono={clima?.icono ?? "nublado"}
            variante="oscuro"
          />
          <TarjetaResumen
            titulo="Estado Costa Maullín"
            valor={estadoGeneral.titulo}
            detalle="Sin alertas activas."
            icono={iconoEstado}
            variante={varianteEstado}
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
          icono="calendario"
          variante="amarillo"
        />

        {avisoDestacado && (
          <TarjetaResumen titulo="Aviso" valor={avisoDestacado.titulo} detalle={avisoDestacado.texto} />
        )}

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">
            Accesos rápidos
          </p>
          <div className="flex flex-col gap-3">
            {accesos.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="tarjeta flex items-center gap-4 rounded-3xl px-5 py-4 transition hover:bg-arena-200"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bosque-300/30 text-bosque-700">
                  <Icono nombre={a.icono} className="h-6 w-6" />
                </span>
                <span className="flex-1 text-base font-medium text-bosque-900">{a.label}</span>
                <Icono nombre="flecha" className="h-5 w-5 shrink-0 text-bosque-300" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
