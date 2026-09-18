import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { TarjetaResumen } from "@/components/ui/TarjetaResumen";
import { FormularioCuota } from "@/components/ui/FormularioCuota";
import { FormularioRegistrarPago } from "@/components/ui/FormularioRegistrarPago";
import { BotonExportarCSV } from "@/components/ui/BotonExportarCSV";
import { Icono } from "@/components/ui/Icono";

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  pagado: { texto: "Pagado", clase: "bg-bosque-500 text-arena-100" },
  pendiente: { texto: "Pendiente", clase: "bg-amarillo-semaforo/40 text-bosque-900" },
  vencido: { texto: "Vencido", clase: "bg-rojo-semaforo text-arena-100" },
  pago_parcial: { texto: "Pago parcial", clase: "bg-amarillo-semaforo/25 text-bosque-900" },
  ajuste_exento: { texto: "Exento", clase: "bg-arena-300 text-bosque-900" },
};

function formatoCLP(monto: number) {
  return monto.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default async function PaginaPanelTesoreria() {
  const usuario = await obtenerUsuarioActual();
  const puedeVerPagos = tienePermiso(usuario, "tesoreria.ver_pagos");
  const puedeRegistrarPago = tienePermiso(usuario, "tesoreria.registrar_pago");
  const puedeModificarPago = tienePermiso(usuario, "tesoreria.modificar_pago");
  const puedeGenerarComprobante = tienePermiso(usuario, "tesoreria.generar_comprobante");
  const puedeExportar = tienePermiso(usuario, "tesoreria.exportar_reportes");
  const puedeRegistrarGasto = tienePermiso(usuario, "tesoreria.registrar_gasto");

  if (!puedeVerPagos) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-16 text-center text-bosque-500">
        <Icono nombre="tesoreria" className="h-8 w-8 text-bosque-500" />
        <p className="text-sm">No tienes acceso a esta sección.</p>
      </div>
    );
  }

  const supabase = await crearClienteServidor();

  const [{ data: movimientos }, { data: gastos }, { data: configCaja }, { data: vinculos }, formularioData] =
    await Promise.all([
      supabase
        .from("movimientos")
        .select(
          "id, periodo, monto_cuota, monto_pagado, estado, fecha_emision, fecha_vencimiento, fecha_pago, medio_pago, conceptos(nombre), parcelas(id, numero)",
        )
        .order("fecha_emision", { ascending: false }),
      supabase
        .from("gastos")
        .select("fecha, categoria, descripcion, monto")
        .order("fecha", { ascending: false }),
      supabase.from("configuracion").select("valor").eq("clave", "caja_tesoreria").maybeSingle(),
      supabase.from("propietario_parcela").select("parcela_id, usuario_id").eq("estado", "aprobado"),
      puedeRegistrarPago
        ? Promise.all([
            supabase.from("parcelas").select("id, numero").order("numero"),
            supabase.from("conceptos").select("id, nombre").eq("activo", true).order("nombre"),
          ])
        : Promise.resolve(null),
    ]);

  // Nombre del propietario por parcela: propietario_parcela y perfiles apuntan
  // ambos a usuarios, así que se cruzan a mano en vez de un embed anidado.
  const usuarioIds = Array.from(new Set((vinculos ?? []).map((v: any) => v.usuario_id).filter(Boolean)));
  const { data: perfilesPropietarios } = usuarioIds.length
    ? await supabase.from("perfiles").select("usuario_id, nombre, apellidos").in("usuario_id", usuarioIds)
    : { data: [] as any[] };

  const nombrePorUsuario = new Map(
    (perfilesPropietarios ?? []).map((p: any) => [p.usuario_id, [p.nombre, p.apellidos].filter(Boolean).join(" ")]),
  );
  const propietarioPorParcela = new Map(
    (vinculos ?? []).map((v: any) => [v.parcela_id, nombrePorUsuario.get(v.usuario_id) ?? ""]),
  );

  const listaMovimientos = movimientos ?? [];
  const ingresos = listaMovimientos.reduce((acc: number, m: any) => acc + (m.monto_pagado ?? 0), 0);
  const egresos = (gastos ?? []).reduce((acc: number, g: any) => acc + (g.monto ?? 0), 0);
  const caja = (configCaja?.valor as any) ?? { base: 0 };
  const saldoEnCaja = (caja.base ?? 0) + ingresos - egresos;

  const pendientes = listaMovimientos
    .filter((m: any) => m.estado !== "pagado" && m.estado !== "ajuste_exento")
    .sort((a: any, b: any) => {
      const fa = a.fecha_vencimiento ?? a.fecha_emision;
      const fb = b.fecha_vencimiento ?? b.fecha_emision;
      return fa < fb ? -1 : fa > fb ? 1 : 0;
    });

  const pagados = listaMovimientos.filter((m: any) => m.estado === "pagado");

  const porCobrar = pendientes.reduce(
    (acc: number, m: any) => acc + Math.max((m.monto_cuota ?? 0) - (m.monto_pagado ?? 0), 0),
    0,
  );
  const parcelasConDeuda = new Set(pendientes.map((m: any) => m.parcelas?.id)).size;

  const filasCsvMovimientos = listaMovimientos.map((m: any) => [
    m.parcelas?.numero ?? "",
    propietarioPorParcela.get(m.parcelas?.id) ?? "",
    m.conceptos?.nombre ?? "",
    m.periodo ?? "",
    m.monto_cuota ?? 0,
    m.monto_pagado ?? 0,
    ESTADOS[m.estado]?.texto ?? m.estado,
    m.fecha_emision ?? "",
    m.fecha_vencimiento ?? "",
    m.fecha_pago ?? "",
    m.medio_pago ?? "",
  ]);

  const filasCsvGastos = (gastos ?? []).map((g: any) => [g.fecha ?? "", g.categoria ?? "", g.descripcion ?? "", g.monto ?? 0]);

  return (
    <div className="flex flex-col gap-5 px-5 py-8">
      <div>
        <Link href="/comunidad/tesoreria" className="text-sm font-medium text-bosque-700 hover:underline">
          ← Tesorería transparente
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-bosque-900">Panel de Tesorería</h1>
        <p className="text-sm text-bosque-500">
          Cobros, pagos, comprobantes y reportes de Costa Maullín en un solo lugar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TarjetaResumen
          titulo="Saldo en caja"
          valor={formatoCLP(saldoEnCaja)}
          detalle="Base + ingresos − egresos"
          icono="tesoreria"
          variante="oscuro"
        />
        <TarjetaResumen
          titulo="Por cobrar"
          valor={formatoCLP(porCobrar)}
          detalle={`${parcelasConDeuda} parcela(s) con deuda`}
          icono="alerta"
          variante={porCobrar > 0 ? "amarillo" : "claro"}
        />
        <TarjetaResumen titulo="Ingresos" valor={formatoCLP(ingresos)} icono="check" variante="claro" />
        <TarjetaResumen titulo="Egresos" valor={formatoCLP(egresos)} icono="pagos" variante="claro" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wide text-bosque-500">
            Cobros pendientes ({pendientes.length})
          </p>
          {puedeRegistrarPago && formularioData && (
            <FormularioCuota parcelas={formularioData[0].data ?? []} conceptos={formularioData[1].data ?? []} />
          )}
        </div>

        {pendientes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {pendientes.map((m: any) => {
              const estado = ESTADOS[m.estado] ?? ESTADOS.pendiente;
              const adeudado = Math.max((m.monto_cuota ?? 0) - (m.monto_pagado ?? 0), 0);
              return (
                <div key={m.id} className="tarjeta flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-bosque-900">
                        Parcela {m.parcelas?.numero ?? "—"}
                        {propietarioPorParcela.get(m.parcelas?.id) && (
                          <span className="font-normal text-bosque-500">
                            {" "}
                            · {propietarioPorParcela.get(m.parcelas?.id)}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-bosque-500">
                        {m.conceptos?.nombre ?? "Cuota"} · {m.periodo}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.clase}`}>
                      {estado.texto}
                    </span>
                  </div>
                  <p className="text-sm text-bosque-700">
                    Adeudado {formatoCLP(adeudado)}{" "}
                    <span className="text-bosque-500">de {formatoCLP(m.monto_cuota)}</span>
                  </p>
                  {m.fecha_vencimiento && (
                    <p className="text-xs text-bosque-500">
                      Vence el{" "}
                      {new Date(m.fecha_vencimiento).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {puedeModificarPago && <FormularioRegistrarPago movimiento={m} />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
            <Icono nombre="check" className="h-8 w-8 text-bosque-500" />
            <p className="text-sm">No hay cobros pendientes.</p>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">
          Historial de pagos ({pagados.length})
        </p>
        {pagados.length > 0 ? (
          <div className="flex flex-col gap-2">
            {pagados.map((m: any) => (
              <div key={m.id} className="tarjeta flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-bosque-900">
                    Parcela {m.parcelas?.numero ?? "—"} · {m.conceptos?.nombre ?? "Cuota"}
                  </p>
                  <p className="text-xs text-bosque-500">
                    {m.periodo} · {formatoCLP(m.monto_pagado ?? 0)}
                    {m.fecha_pago &&
                      ` · ${new Date(m.fecha_pago).toLocaleDateString("es-CL", { day: "numeric", month: "long" })}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {puedeModificarPago && <FormularioRegistrarPago movimiento={m} />}
                  {puedeGenerarComprobante && (
                    <Link
                      href={`/comunidad/tesoreria/comprobante/${m.id}`}
                      className="rounded-full bg-bosque-500 px-3.5 py-2 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
                    >
                      Comprobante
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
            <p className="text-sm">Todavía no hay pagos registrados.</p>
          </div>
        )}
      </div>

      {puedeRegistrarGasto && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">Gastos y saldo</p>
          <Link
            href="/comunidad/tesoreria"
            className="tarjeta flex items-center gap-4 rounded-3xl px-5 py-4 transition hover:bg-arena-200"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bosque-300/30 text-bosque-700">
              <Icono nombre="pagos" className="h-5 w-5" />
            </span>
            <span className="flex-1 text-sm font-medium text-bosque-900">
              Registrar gastos y ajustar el saldo en caja
            </span>
            <Icono nombre="flecha" className="h-5 w-5 shrink-0 text-bosque-300" />
          </Link>
        </div>
      )}

      {puedeExportar && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">Exportar reportes</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <BotonExportarCSV
              nombreArchivo="movimientos-costa-maullin.csv"
              encabezados={[
                "Parcela",
                "Propietario",
                "Concepto",
                "Período",
                "Monto cuota",
                "Monto pagado",
                "Estado",
                "Fecha emisión",
                "Fecha vencimiento",
                "Fecha pago",
                "Medio de pago",
              ]}
              filas={filasCsvMovimientos}
              etiqueta="Exportar cobros (CSV)"
            />
            <BotonExportarCSV
              nombreArchivo="gastos-costa-maullin.csv"
              encabezados={["Fecha", "Categoría", "Descripción", "Monto"]}
              filas={filasCsvGastos}
              etiqueta="Exportar gastos (CSV)"
            />
          </div>
          <p className="mt-2 text-xs text-bosque-500">
            Los archivos CSV se abren directamente en Excel o Google Sheets.
          </p>
        </div>
      )}
    </div>
  );
}
