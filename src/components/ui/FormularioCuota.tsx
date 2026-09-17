"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function FormularioCuota({
  parcelas,
  conceptos,
}: {
  parcelas: { id: string; numero: string }[];
  conceptos: { id: string; nombre: string }[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [parcelaId, setParcelaId] = useState(parcelas[0]?.id ?? "");
  const [conceptoId, setConceptoId] = useState(conceptos[0]?.id ?? "");
  const [periodo, setPeriodo] = useState("");
  const [monto, setMonto] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("movimientos").insert({
      parcela_id: parcelaId,
      concepto_id: conceptoId,
      periodo,
      monto_cuota: Number(monto),
      fecha_emision: new Date().toISOString().slice(0, 10),
      fecha_vencimiento: vencimiento || null,
      usuario_registro_id: user?.id ?? null,
    });

    setEnviando(false);

    if (error) {
      setError("No se pudo registrar la cuota. Intenta nuevamente.");
      return;
    }

    setPeriodo("");
    setMonto("");
    setVencimiento("");
    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-full bg-bosque-700 px-4 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
      >
        + Registrar cuota
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-3 p-4">
      <select
        value={parcelaId}
        onChange={(e) => setParcelaId(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      >
        {parcelas.map((p) => (
          <option key={p.id} value={p.id}>
            Parcela {p.numero}
          </option>
        ))}
      </select>
      <select
        value={conceptoId}
        onChange={(e) => setConceptoId(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      >
        {conceptos.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
      <input
        type="text"
        required
        placeholder="Período (ej. Enero 2026)"
        value={periodo}
        onChange={(e) => setPeriodo(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <input
        type="number"
        required
        placeholder="Monto de la cuota"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <label className="flex flex-col gap-1 text-sm text-bosque-700">
        Fecha de vencimiento (opcional)
        <input
          type="date"
          value={vencimiento}
          onChange={(e) => setVencimiento(e.target.value)}
          className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
      </label>

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Registrar"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded-full bg-bosque-500 px-4 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
