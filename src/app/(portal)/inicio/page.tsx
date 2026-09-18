import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { TarjetaResumen } from "@/components/ui/TarjetaResumen";
import { FormularioEstadoGeneral } from "@/components/ui/FormularioEstadoGeneral";
import { Icono, type NombreIcono } from "@/components/ui/Icono";

// Coordenadas de Maullín, Chile.
const LAT = -41.6167;
const LON = -73.6167;

function iconoContacto(nombre: string): NombreIcono {
  if (nombre.startsWith("Bomberos")) return "fuego";
  if (nombre.startsWith("Carabineros")) return "escudo";
  if (nombre.startsWith("SAMU") || nombre.startsWith("Hospital")) return "cruz";
  return "alerta";
}

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
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max&forecast_days=3&timezone=America%2FSantiago`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const temp = data?.current?.temperature_2m;
    const codigo = data?.current?.weather_code;
    if (typeof temp !== "number" || typeof codigo !== "number") return null;

    const fechas: string[] = data?.daily?.time ?? [];
    const codigosDiarios: number[] = data?.daily?.weather_code ?? [];
    const maximas: number[] = data?.daily?.temperature_2m_max ?? [];
    const dias = fechas.map((fecha, i) => ({
      fecha,
      temp: Math.round(maximas[i]),
      ...climaDesdeCodigo(codigosDiarios[i]),
    }));

    return { temp: Math.round(temp), ...climaDesdeCodigo(codigo), dias };
  } catch {
    return null;
  }
}

export default async function PaginaInicio() {
  const usuario = await obtenerUsuarioActual();
  const puedeEditarEstado = tienePermiso(usuario, "comunidad.estado_general");

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
        .in("nombre", ["Bomberos", "Carabineros", "Hospital de Maullín"])
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
        {/* Mobile: logo centrado y saludo simple */}
        <div className="mx-auto flex flex-col items-center gap-1 text-center sm:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-costa-maullin-blanco.png"
            alt="Costa Maullín"
            className="h-[5.6rem] w-auto"
          />
          <h1 className="text-2xl font-semibold text-arena-100">
            Hola{nombre ? `, ${nombre}` : ""}
          </h1>
          {primeraParcela && (
            <p className="text-sm text-arena-200">Parcela {primeraParcela.numero}</p>
          )}
        </div>

        {/* Escritorio: layout original sin cambios */}
        <div className="hidden items-center gap-3 sm:flex">
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

        <div className="grid grid-cols-2 gap-3">
          <TarjetaResumen
            titulo="Clima · Maullín"
            valor={clima ? `${clima.temp}°` : "—"}
            detalle={clima ? clima.texto : "No disponible"}
            icono={clima?.icono ?? "nublado"}
            variante="oscuro"
          >
            {clima?.dias && clima.dias.length > 0 && (
              <div className="mt-1 flex gap-1.5">
                {clima.dias.map((d, i) => {
                  const esHoy = i === 0;
                  const etiqueta = esHoy
                    ? "Hoy"
                    : new Date(`${d.fecha}T00:00:00`).toLocaleDateString("es-CL", {
                        weekday: "short",
                      });
                  return (
                    <div
                      key={d.fecha}
                      className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 ${
                        esHoy ? "bg-arena-100/15 ring-1 ring-arena-100/40" : ""
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium capitalize ${
                          esHoy ? "text-arena-100" : "text-bosque-300"
                        }`}
                      >
                        {etiqueta}
                      </span>
                      <Icono nombre={d.icono} className="h-4 w-4 text-arena-100" />
                      <span className="text-xs font-semibold text-arena-100">{d.temp}°</span>
                    </div>
                  );
                })}
              </div>
            )}
          </TarjetaResumen>
          <TarjetaResumen
            titulo="Estado Costa Maullín"
            valor={estadoGeneral.titulo}
            detalle={
              estadoGeneral.nivel === "verde" || !estadoGeneral.nivel
                ? "Sin alertas activas."
                : "Mantente atento a las novedades."
            }
            icono={iconoEstado}
            variante={varianteEstado}
          >
            {puedeEditarEstado && (
              <FormularioEstadoGeneral
                nivelActual={estadoGeneral.nivel ?? "verde"}
                tituloActual={estadoGeneral.titulo}
              />
            )}
          </TarjetaResumen>
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

        {contactosEmergencia && contactosEmergencia.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-rojo-semaforo/40 bg-rojo-semaforo/10 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rojo-semaforo">
              <Icono nombre="alerta" className="h-4 w-4" />
              Emergencias
            </p>
            <div className="grid grid-cols-2 gap-2">
              {contactosEmergencia.map((c: any) => {
                const zona = c.cargo?.includes("Carelmapu") ? " (Carelmapu)" : "";
                const etiqueta = `${c.nombre.split(" / ")[0]}${zona}`;
                return (
                  <a
                    key={`${c.nombre}-${c.cargo}`}
                    href={`tel:${c.telefono.replace(/[^0-9+]/g, "")}`}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 text-center shadow-sm transition hover:bg-rojo-semaforo/5"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rojo-semaforo/15 text-rojo-semaforo">
                      <Icono nombre={iconoContacto(c.nombre)} className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-bosque-900">{etiqueta}</span>
                    <span className="text-sm font-semibold text-rojo-semaforo">{c.telefono}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
