import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { FormularioGasto } from "@/components/ui/FormularioGasto";
import { FormularioSaldoCaja } from "@/components/ui/FormularioSaldoCaja";
import { GestionGasto } from "@/components/ui/GestionGasto";
import { Icono } from "@/components/ui/Icono";

const CATEGORIA_LABEL: Record<string, string> = {
  mantencion: "Mantención",
  seguridad: "Seguridad",
  administracion: "Administración",
  servicios_basicos: "Servicios básicos",
  otro: "Otro",
};

function formatoCLP(monto: number) {
  return monto.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

export default async function PaginaTesoreria() {
  const usuario = await obtenerUsuarioActual();
  const puedeRegistrarGasto = tienePermiso(usuario, "tesoreria.registrar_gasto");
  const puedeGestionar = tienePermiso(usuario, "tesoreria.ver_pagos");

  const supabase = await crearClienteServidor();

  const [{ data: movimientos }, { data: gastos }, { data: configCaja }] = await Promise.all([
    supabase.from("movimientos").select("monto_pagado"),
    supabase
      .from("gastos")
      .select("id, fecha, categoria, descripcion, monto, comprobante_url")
      .order("fecha", { ascending: false }),
    supabase.from("configuracion").select("valor").eq("clave", "caja_tesoreria").maybeSingle(),
  ]);

  const ingresos = (movimientos ?? []).reduce((acc, m: any) => acc + (m.monto_pagado ?? 0), 0);
  const egresos = (gastos ?? []).reduce((acc, g: any) => acc + (g.monto ?? 0), 0);

  const caja = (configCaja?.valor as any) ?? { base: 0, actualizado: null };
  // El saldo en caja se recalcula solo: la base es el último ajuste manual de
  // tesorería, y desde ahí cada ingreso registrado suma y cada gasto resta.
  const saldoEnCaja = (caja.base ?? 0) + ingresos - egresos;

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <div>
        <h1 className="text-xl font-semibold text-bosque-900">Tesorería transparente</h1>
        <p className="text-sm text-bosque-500">
          Recaudación, gastos y saldo disponible de Costa Maullín, a la vista de todos.
        </p>
        {puedeGestionar && (
          <Link
            href="/comunidad/tesoreria/panel"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-bosque-700 hover:underline"
          >
            <Icono nombre="tesoreria" className="h-4 w-4" />
            Ir al panel de tesorería →
          </Link>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 rounded-2xl bg-bosque-700 p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-arena-200">Saldo en caja</p>
        <p className="text-4xl font-bold text-arena-100">{formatoCLP(saldoEnCaja)}</p>
        {caja.actualizado && (
          <p className="text-xs text-arena-200">
            Último ajuste el{" "}
            {new Date(caja.actualizado).toLocaleDateString("es-CL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        {puedeRegistrarGasto && (
          <FormularioSaldoCaja montoActual={saldoEnCaja} ingresos={ingresos} egresos={egresos} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="tarjeta flex flex-col gap-1 p-4">
          <p className="text-xs uppercase tracking-wide text-bosque-500">Ingresos registrados</p>
          <p className="text-lg font-semibold text-bosque-900">{formatoCLP(ingresos)}</p>
        </div>
        <div className="tarjeta flex flex-col gap-1 p-4">
          <p className="text-xs uppercase tracking-wide text-bosque-500">Egresos registrados</p>
          <p className="text-lg font-semibold text-bosque-900">{formatoCLP(egresos)}</p>
        </div>
      </div>
      <p className="-mt-2 text-xs text-bosque-500">
        El saldo en caja de arriba se ajusta solo: suma cada ingreso y resta cada gasto que se registre
        aquí. Tesorería puede corregirlo manualmente cuando haga una conciliación.
      </p>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-bosque-500">Detalle de gastos</p>
        {puedeRegistrarGasto && <FormularioGasto />}
      </div>

      {gastos && gastos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {gastos.map((g: any) => (
            <div key={g.id} className="tarjeta flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-bosque-900">{g.descripcion}</p>
                  <p className="text-xs text-bosque-500">
                    {CATEGORIA_LABEL[g.categoria] ?? g.categoria} ·{" "}
                    {new Date(g.fecha).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {g.comprobante_url && (
                    <a
                      href={g.comprobante_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center rounded-full bg-bosque-500 px-3 py-1 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
                    >
                      Ver respaldo
                    </a>
                  )}
                </div>
                <p className="shrink-0 font-medium text-bosque-900">{formatoCLP(g.monto)}</p>
              </div>
              {puedeRegistrarGasto && <GestionGasto gasto={g} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
          <Icono nombre="pagos" className="h-8 w-8 text-bosque-500" />
          <p className="text-sm">Todavía no hay gastos registrados.</p>
        </div>
      )}
    </div>
  );
}
