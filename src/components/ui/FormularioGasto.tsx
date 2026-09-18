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

export function FormularioGasto() {
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [categoria, setCategoria] = useState("otro");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let comprobante_url: string | null = null;

    if (comprobante) {
      const ruta = `gastos/${Date.now()}-${comprobante.name}`;
      const { error: errorSubida } = await supabase.storage.from("adjuntos").upload(ruta, comprobante);

      if (errorSubida) {
        setEnviando(false);
        setError("No se pudo subir el respaldo. Intenta nuevamente.");
        return;
      }

      const { data: publica } = supabase.storage.from("adjuntos").getPublicUrl(ruta);
      comprobante_url = publica.publicUrl;
    }

    const { error: errorInsert } = await supabase.from("gastos").insert({
      fecha,
      categoria,
      descripcion,
      monto: montoNumerico,
      comprobante_url,
      usuario_registro_id: user?.id ?? null,
    });

    setEnviando(false);

    if (errorInsert) {
      setError("No se pudo registrar el gasto. Intenta nuevamente.");
      return;
    }

    setFecha(new Date().toISOString().slice(0, 10));
    setCategoria("otro");
    setDescripcion("");
    setMonto("");
    setComprobante(null);
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
        + Registrar gasto
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-3 p-4">
      <input
        type="date"
        required
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
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
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <input
        type="number"
        required
        min="1"
        step="1"
        placeholder="Monto (CLP)"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <SelectorArchivo
        label="Adjuntar respaldo (boleta/factura)"
        accept="image/*,.pdf"
        onChange={(archivos) => setComprobante(archivos?.[0] ?? null)}
      />

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar gasto"}
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
