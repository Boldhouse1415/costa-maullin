import Link from "next/link";
import { notFound } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { BotonImprimir } from "@/components/ui/BotonImprimir";

function formatoCLP(monto: number) {
  return monto.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}

function formatoFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PaginaComprobante({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await crearClienteServidor();

  const { data: movimiento } = await supabase
    .from("movimientos")
    .select(
      "id, periodo, monto_cuota, monto_pagado, estado, fecha_pago, fecha_emision, medio_pago, observaciones, conceptos(nombre), parcelas(id, numero)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!movimiento) notFound();

  const parcela = movimiento.parcelas as any;
  const concepto = movimiento.conceptos as any;

  let propietario = "";
  if (parcela?.id) {
    const { data: vinculo } = await supabase
      .from("propietario_parcela")
      .select("usuario_id")
      .eq("parcela_id", parcela.id)
      .eq("estado", "aprobado")
      .limit(1)
      .maybeSingle();

    if (vinculo?.usuario_id) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("nombre, apellidos")
        .eq("usuario_id", vinculo.usuario_id)
        .maybeSingle();
      propietario = [perfil?.nombre, perfil?.apellidos].filter(Boolean).join(" ");
    }
  }

  const folio = movimiento.id.slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-5 py-8 print:px-0 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/comunidad/tesoreria/panel" className="text-sm font-medium text-bosque-700 hover:underline">
          ← Volver al panel
        </Link>
      </div>

      <div className="tarjeta flex flex-col gap-4 p-6 print:border-0 print:shadow-none">
        <div className="flex flex-col items-center gap-1 border-b border-arena-300 pb-4 text-center">
          <p className="text-lg font-semibold text-bosque-900">Costa Maullín</p>
          <p className="text-xs uppercase tracking-wide text-bosque-500">Comprobante de pago</p>
          <p className="text-xs text-bosque-500">Folio {folio}</p>
        </div>

        <div className="flex flex-col divide-y divide-arena-300">
          <Fila etiqueta="Parcela" valor={parcela?.numero ? `Parcela ${parcela.numero}` : "—"} />
          <Fila etiqueta="Propietario" valor={propietario || "—"} />
          <Fila etiqueta="Concepto" valor={concepto?.nombre ?? "Cuota"} />
          <Fila etiqueta="Período" valor={movimiento.periodo} />
          <Fila etiqueta="Monto cuota" valor={formatoCLP(movimiento.monto_cuota)} />
          <Fila etiqueta="Monto pagado" valor={formatoCLP(movimiento.monto_pagado ?? 0)} />
          <Fila
            etiqueta="Fecha de pago"
            valor={movimiento.fecha_pago ? formatoFecha(movimiento.fecha_pago) : "—"}
          />
          <Fila etiqueta="Medio de pago" valor={movimiento.medio_pago ?? "—"} />
          {movimiento.observaciones && <Fila etiqueta="Observaciones" valor={movimiento.observaciones} />}
        </div>

        <p className="text-center text-xs text-bosque-500">
          Emitido el {formatoFecha(new Date().toISOString())} · Costa Maullín
        </p>
      </div>

      <BotonImprimir />
    </div>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="text-bosque-500">{etiqueta}</span>
      <span className="text-right font-medium text-bosque-900">{valor}</span>
    </div>
  );
}
