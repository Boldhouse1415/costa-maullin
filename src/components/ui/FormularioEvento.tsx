"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function FormularioEvento({
  categorias,
}: {
  categorias: { id: string; nombre: string }[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? "");
  const [lugar, setLugar] = useState("");
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

    const { error } = await supabase.from("eventos").insert({
      titulo,
      descripcion: descripcion || null,
      fecha,
      hora: hora || null,
      categoria_id: categoriaId || null,
      lugar: lugar || null,
      usuario_id: user?.id ?? null,
    });

    setEnviando(false);

    if (error) {
      setError("No se pudo guardar el evento. Intenta nuevamente.");
      return;
    }

    setTitulo("");
    setDescripcion("");
    setFecha("");
    setHora("");
    setLugar("");
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
        + Nuevo evento
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-3 p-4">
      <input
        type="text"
        required
        placeholder="Título del evento"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <div className="flex gap-2">
        <input
          type="date"
          required
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="h-11 flex-1 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="h-11 flex-1 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
      </div>
      {categorias.length > 0 && (
        <select
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        >
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
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <textarea
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={3}
        className="rounded-xl border border-arena-300 bg-white px-3 py-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar evento"}
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
