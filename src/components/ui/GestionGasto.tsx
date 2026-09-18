"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { SelectorArchivo } from "./SelectorArchivo";

const CATEGORIAS = [
  { valor: "mantencion", etiqueta: "Mantención" },
  { valor: "seguridad", etiqueta: "Seguridad" },
  { valor: "administracion", etiqueta: "Administración" },
  { valor: "servicios_basicos", etiqueta: "Servicios básicos" },
  { valor: "otro", etiqueta: "Otro" },
];

type Gasto = {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  comprobante_url: string | null;
};

export function GestionGasto({ gasto }: { gasto: Gasto }) {
  const [modo, setModo] = useState<"ver" | "editar" | "eliminar">("ver");
  const [fecha, setFecha] = useState(gasto.fecha);
  const [categoria, setCategoria] = useState(gasto.categoria);
  const [descripcion, setDescripcion] = useState(gasto.descripcion);
  const [monto, setMonto] = useState(String(gasto.monto));
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const montoNumerico = Number(monto);
    if (!descripcion || !montoNumerico || montoNumerico <= 0) {
      setError("Completa una descripción y un monto válido.");
      return;
    }

    setEnviando(true);

    let comprobante_url = gasto.comprobante_url;

    if (comprobante) {
      const ruta = `gastos/${Date.now()}-${comprobante.name}`;
      const { error: errorSubida } = await supabase.storage.from("adjuntos").upload(ruta, comprobante);

      if (errorSubida) {
        setEnviando(false);
        setError("No se pudo subir el nuevo respaldo. Intenta nuevamente.");
        return;
      }

      const { data: publica } = supabase.storage.from("adjuntos").getPublicUrl(ruta);
      comprobante_url = publica.publicUrl;
    }

    const { error: errorUpdate } = await supabase
      .from("gastos")
      .update({ fecha, categoria, descripcion, monto: montoNumerico, comprobante_url })
      .eq("id", gasto.id);

    setEnviando(false);

    if (errorUpdate) {
      setError("No se pudo guardar los cambios. Intenta nuevamente.");
      return;
    }

    setModo("ver");
    router.refresh();
  }

  async function eliminar() {
    setEnviando(true);
    setError(null);

    const { error: errorDelete } = await supabase.from("gastos").delete().eq("id", gasto.id);

    setEnviando(false);

    if (errorDelete) {
      setError("No se pudo eliminar el gasto. Intenta nuevamente.");
      return;
    }

    router.refresh();
  }

  if (modo === "eliminar") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-rojo-semaforo/10 p-3">
        <p className="text-sm text-bosque-900">¿Eliminar este gasto? No se puede deshacer.</p>
        {error && <p className="text-xs text-rojo-semaforo">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={eliminar}
            disabled={enviando}
            className="flex-1 rounded-full bg-rojo-semaforo py-2 text-xs font-medium text-arena-100 transition hover:opacity-90 disabled:opacity-60"
          >
            {enviando ? "Eliminando…" : "Sí, eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setModo("ver")}
            className="rounded-full bg-bosque-500 px-4 py-2 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (modo === "editar") {
    return (
      <form onSubmit={guardar} className="flex flex-col gap-2 rounded-2xl bg-arena-200/60 p-3">
        <input
          type="date"
          required
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        >
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.etiqueta}
            </option>
          ))}
        </select>
        <input
          type="text"
          required
          placeholder="Descripción del gasto"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
        <input
          type="number"
          required
          min="1"
          step="1"
          placeholder="Monto (CLP)"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
        <SelectorArchivo
          label="Cambiar respaldo (opcional)"
          accept="image/*,.pdf"
          onChange={(archivos) => setComprobante(archivos?.[0] ?? null)}
        />
        {error && <p className="text-xs text-rojo-semaforo">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={enviando}
            className="flex-1 rounded-full bg-bosque-700 py-2 text-xs font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
          >
            {enviando ? "Guardando…" : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => setModo("ver")}
            className="rounded-full bg-bosque-500 px-4 py-2 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setModo("editar")}
        className="rounded-full bg-bosque-500 px-3 py-1.5 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => setModo("eliminar")}
        className="rounded-full bg-rojo-semaforo/15 px-3 py-1.5 text-xs font-medium text-rojo-semaforo transition hover:bg-rojo-semaforo/25"
      >
        Eliminar
      </button>
    </div>
  );
}
