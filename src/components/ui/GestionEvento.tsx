"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

type Evento = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  hora: string | null;
  lugar: string | null;
  categoria_id: string | null;
};

export function GestionEvento({
  evento,
  categorias,
}: {
  evento: Evento;
  categorias: { id: string; nombre: string }[];
}) {
  const [modo, setModo] = useState<"ver" | "editar" | "eliminar">("ver");
  const [titulo, setTitulo] = useState(evento.titulo);
  const [descripcion, setDescripcion] = useState(evento.descripcion ?? "");
  const [fecha, setFecha] = useState(evento.fecha);
  const [hora, setHora] = useState(evento.hora ? evento.hora.slice(0, 5) : "");
  const [lugar, setLugar] = useState(evento.lugar ?? "");
  const [categoriaId, setCategoriaId] = useState(evento.categoria_id ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo || !fecha) {
      setError("Completa al menos el título y la fecha.");
      return;
    }

    setEnviando(true);

    const { error: errorUpdate } = await supabase
      .from("eventos")
      .update({
        titulo,
        descripcion: descripcion || null,
        fecha,
        hora: hora || null,
        lugar: lugar || null,
        categoria_id: categoriaId || null,
      })
      .eq("id", evento.id);

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

    const { error: errorDelete } = await supabase.from("eventos").delete().eq("id", evento.id);

    setEnviando(false);

    if (errorDelete) {
      setError("No se pudo eliminar el evento. Intenta nuevamente.");
      return;
    }

    router.refresh();
  }

  if (modo === "eliminar") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-rojo-semaforo/10 p-3">
        <p className="text-sm text-bosque-900">¿Eliminar este evento? No se puede deshacer.</p>
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
          type="text"
          required
          placeholder="Título del evento"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
        <div className="flex gap-2">
          <input
            type="date"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
          />
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
          />
        </div>
        {categorias.length > 0 && (
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          placeholder="Lugar (opcional)"
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="rounded-xl border border-arena-300 bg-white px-3 py-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
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
