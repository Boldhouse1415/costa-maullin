"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

const NIVELES = [
  { valor: "verde", etiqueta: "Normal" },
  { valor: "amarillo", etiqueta: "Atención" },
  { valor: "rojo", etiqueta: "Alerta" },
];

export function FormularioEstadoGeneral({
  nivelActual,
  tituloActual,
}: {
  nivelActual: string;
  tituloActual: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [nivel, setNivel] = useState(nivelActual);
  const [titulo, setTitulo] = useState(tituloActual);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  // El fondo de la tarjeta cambia según el nivel (verde/amarillo = claro,
  // rojo = oscuro), así que el botón usa un overlay que se lea bien en
  // ambos casos.
  const claro = nivelActual !== "rojo";
  const estiloBoton = claro
    ? "bg-black/10 text-bosque-900 hover:bg-black/15"
    : "bg-white/20 text-arena-100 hover:bg-white/30";

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo.trim()) {
      setError("Escribe un título.");
      return;
    }

    setEnviando(true);

    const { error: errorUpdate } = await supabase
      .from("configuracion")
      .update({ valor: { nivel, titulo: titulo.trim() } })
      .eq("clave", "estado_general");

    setEnviando(false);

    if (errorUpdate) {
      setError("No se pudo actualizar el estado. Intenta nuevamente.");
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
        className={`self-start rounded-full px-3 py-1.5 text-xs font-medium transition ${estiloBoton}`}
      >
        Cambiar estado
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-2">
      <select
        value={nivel}
        onChange={(e) => setNivel(e.target.value)}
        className="h-10 rounded-xl border border-arena-300 bg-white px-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      >
        {NIVELES.map((n) => (
          <option key={n.valor} value={n.valor}>
            {n.etiqueta}
          </option>
        ))}
      </select>
      <input
        type="text"
        required
        placeholder="Título del estado"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="h-10 rounded-xl border border-arena-300 bg-white px-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      {error && <p className="text-xs text-rojo-semaforo">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-1.5 text-xs font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${estiloBoton}`}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
