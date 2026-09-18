"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function FormularioSaldoCaja({ montoActual }: { montoActual: number }) {
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState(String(montoActual));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const montoNumerico = Number(monto);
    if (!monto || montoNumerico < 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    setEnviando(true);

    const { error: errorUpdate } = await supabase
      .from("configuracion")
      .update({
        valor: {
          monto: montoNumerico,
          actualizado: new Date().toISOString().slice(0, 10),
        },
      })
      .eq("clave", "caja_tesoreria");

    setEnviando(false);

    if (errorUpdate) {
      setError("No se pudo actualizar el saldo. Intenta nuevamente.");
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
        className="rounded-full bg-arena-100/20 px-4 py-2 text-xs font-medium text-arena-100 transition hover:bg-arena-100/30"
      >
        Actualizar saldo
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-2">
      <input
        type="number"
        required
        min="0"
        step="1"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-center text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      {error && <p className="text-xs text-rojo-semaforo">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-arena-100 py-2 text-xs font-medium text-bosque-900 transition hover:bg-arena-200 disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-full bg-arena-100/20 px-4 py-2 text-xs font-medium text-arena-100 transition hover:bg-arena-100/30"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
