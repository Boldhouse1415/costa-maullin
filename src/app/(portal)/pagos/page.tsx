import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { BotonCopiar } from "@/components/ui/BotonCopiar";
import { Icono } from "@/components/ui/Icono";
import { FormularioCuota } from "@/components/ui/FormularioCuota";

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

export default async function PaginaPagos() {
  const usuario = await obtenerUsuarioActual();
  const puedeRegistrar = tienePermiso(usuario, "tesoreria.registrar_pago");

  const supabase = await crearClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: config }, { data: vinculos }, formularioData] = await Promise.all([
    supabase.from("configuracion").select("valor").eq("clave", "datos_bancarios_tesoreria").maybeSingle(),
    user
      ? supabase
          .from("propietario_parcela")
          .select("parcela_id, parcelas(numero)")
          .eq("usuario_id", user.id)
          .eq("estado", "aprobado")
      : Promise.resolve({ data: [] as any[] }),
    puedeRegistrar
      ? Promise.all([
          supabase.from("parcelas").select("id, numero").order("numero"),
          supabase.from("conceptos").select("id, nombre").eq("activo", true).order("nombre"),
        ])
      : Promise.resolve(null),
  ]);

  const parcelaIds = (vinculos ?? []).map((v: any) => v.parcela_id);

  const { data: movimientos } = parcelaIds.length
    ? await supabase
        .from("movimientos")
        .select("id, periodo, monto_cuota, monto_pagado, estado, fecha_vencimiento, conceptos(nombre), parcelas(numero)")
        .in("parcela_id", parcelaIds)
        .order("fecha_emision", { ascending: false })
    : { data: [] as any[] };

  const datos = config?.valor as
    | {
        titular?: string;
        rut?: string;
        banco?: string;
        tipo_cuenta?: string;
        numero_cuenta?: string;
      }
    | undefined;

  const filas = datos
    ? [
        { etiqueta: "Titular", valor: datos.titular },
        { etiqueta: "RUT", valor: datos.rut },
        { etiqueta: "Banco", valor: datos.banco },
        { etiqueta: "Tipo de cuenta", valor: datos.tipo_cuenta },
        { etiqueta: "N.° de cuenta", valor: datos.numero_cuenta },
      ].filter((f) => f.valor)
    : [];

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-bosque-900">Mis Pagos</h1>
        {puedeRegistrar && formularioData && (
          <FormularioCuota parcelas={formularioData[0].data ?? []} conceptos={formularioData[1].data ?? []} />
        )}
      </div>

      {filas.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">
            Datos para transferencia
          </p>
          <div className="tarjeta flex flex-col divide-y divide-arena-300 p-4">
            {filas.map((f) => (
              <div key={f.etiqueta} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-xs text-bosque-500">{f.etiqueta}</p>
                  <p className="text-sm font-medium text-bosque-900">{f.valor}</p>
                </div>
                <BotonCopiar valor={f.valor!} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-bosque-500">
          Estado de cuenta
        </p>
        {movimientos && movimientos.length > 0 ? (
          <div className="flex flex-col gap-3">
            {movimientos.map((m: any) => {
              const estado = ESTADOS[m.estado] ?? ESTADOS.pendiente;
              return (
                <div key={m.id} className="tarjeta flex flex-col gap-1 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-bosque-900">
                        {m.conceptos?.nombre ?? "Cuota"} · {m.periodo}
                      </p>
                      {m.parcelas?.numero && (
                        <p className="text-xs text-bosque-500">Parcela {m.parcelas.numero}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.clase}`}>
                      {estado.texto}
                    </span>
                  </div>
                  <p className="text-sm text-bosque-700">
                    {formatoCLP(m.monto_cuota)}
                    {m.monto_pagado > 0 && m.monto_pagado < m.monto_cuota && (
                      <span className="text-bosque-500"> · pagado {formatoCLP(m.monto_pagado)}</span>
                    )}
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
            <Icono nombre="pagos" className="h-8 w-8 text-bosque-500" />
            <p className="text-sm">Todavía no hay cuotas registradas para tu parcela.</p>
          </div>
        )}
      </div>
    </div>
  );
}
