"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

const MEDIOS_PAGO = ["Transferencia", "Efectivo", "Depósito", "Otro"];

const ESTADOS = [
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "pago_parcial", etiqueta: "Pago parcial" },
  { valor: "pagado", etiqueta: "Pagado" },
  { valor: "vencido", etiqueta: "Vencido" },
  { valor: "ajuste_exento", etiqueta: "Exento" },
];

function estadoSugerido(montoPagado: number, montoCuota: number) {
  if (montoPagado <= 0) return "pendiente";
  if (montoPagado >= montoCuota) return "pagado";
  return "pago_parcial";
}

export function FormularioRegistrarPago({
  movimiento,
}: {
  movimiento: {
    id: string;
    monto_cuota: number;
    monto_pagado: number;
    estado: string;
    medio_pago: string | null;
  };
}) {
  const [abierto, setAbierto] = useState(false);
  const [montoPagado, setMontoPagado] = useState(
    String(movimiento.monto_pagado > 0 ? movimiento.monto_pagado : movimiento.monto_cuota),
  );
  const [fechaPago, setFechaPago] = useState(() => new Date().toISOString().slice(0, 10));
  const [medioPago, setMedioPago] = useState(movimiento.medio_pago ?? MEDIOS_PAGO[0]);
  const [estado, setEstado] = useState(
    estadoSugerido(movimiento.monto_pagado > 0 ? movimiento.monto_pagado : movimiento.monto_cuota, movimiento.monto_cuota),
  );
  const [observaciones, setObservaciones] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  function actualizarMonto(valor: string) {
    setMontoPagado(valor);
    setEstado(estadoSugerido(Number(valor) || 0, movimiento.monto_cuota));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const montoNumerico = Number(montoPagado);
    if (Number.isNaN(montoNumerico) || montoNumerico < 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    setEnviando(true);

    const { error: errorUpdate } = await supabase
      .from("movimientos")
      .update({
        monto_pagado: montoNumerico,
        fecha_pago: fechaPago || null,
        medio_pago: medioPago,
        estado,
        observaciones: observaciones || null,
      })
      .eq("id", movimiento.id);

    setEnviando(false);

    if (errorUpdate) {
      setError("No se pudo registrar el pago. Intenta nuevamente.");
      return;
    }

    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-full bg-bosque-700 px-3.5 py-2 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
      >
        {movimiento.estado === "pagado" ? "Editar pago" : "Registrar pago"}
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-2 rounded-2xl bg-arena-200/60 p-3">
      <label className="flex flex-col gap-1 text-xs text-bosque-700">
        Monto pagado
        <input
          type="number"
          required
          min="0"
          step="1"
          value={montoPagado}
          onChange={(e) => actualizarMonto(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
      </label>
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs text-bosque-700">
          Fecha de pago
          <input
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            className="h-10 rounded-xl border border-arena-300 bg-white px-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs text-bosque-700">
          Medio de pago
          <select
            value={medioPago}
            onChange={(e) => setMedioPago(e.target.value)}
            className="h-10 rounded-xl border border-arena-300 bg-white px-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
          >
            {MEDIOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-xs text-bosque-700">
        Estado
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        >
          {ESTADOS.map((es) => (
            <option key={es.valor} value={es.valor}>
              {es.etiqueta}
            </option>
          ))}
        </select>
      </label>
      <input
        type="text"
        placeholder="Observaciones (opcional)"
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />

      {error && <p className="text-xs text-rojo-semaforo">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2 text-xs font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-full bg-bosque-500 px-4 py-2 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
