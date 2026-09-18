"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function FormularioEncuesta() {
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");
  const [opciones, setOpciones] = useState(["", ""]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  function actualizarOpcion(i: number, valor: string) {
    setOpciones((prev) => prev.map((o, idx) => (idx === i ? valor : o)));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const opcionesValidas = opciones.map((o) => o.trim()).filter(Boolean);
    if (!titulo || opcionesValidas.length < 2) {
      setError("Escribe un título y al menos 2 opciones.");
      return;
    }

    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: encuesta, error: errorEncuesta } = await supabase
      .from("encuestas")
      .insert({
        titulo,
        descripcion: descripcion || null,
        fecha_cierre: fechaCierre || null,
        creado_por: user?.id ?? null,
      })
      .select("id")
      .single();

    if (errorEncuesta || !encuesta) {
      setEnviando(false);
      setError("No se pudo crear la votación. Intenta nuevamente.");
      return;
    }

    const { error: errorOpciones } = await supabase.from("encuesta_opciones").insert(
      opcionesValidas.map((texto, orden) => ({
        encuesta_id: encuesta.id,
        texto,
        orden,
      })),
    );

    setEnviando(false);

    if (errorOpciones) {
      setError("La votación se creó, pero hubo un problema guardando las opciones.");
      return;
    }

    setTitulo("");
    setDescripcion("");
    setFechaCierre("");
    setOpciones(["", ""]);
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
        + Nueva votación
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-3 p-4">
      <input
        type="text"
        required
        placeholder="Título de la votación"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <textarea
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={2}
        className="rounded-xl border border-arena-300 bg-white px-3 py-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm text-bosque-700">Opciones</p>
        {opciones.map((o, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Opción ${i + 1}`}
            value={o}
            onChange={(e) => actualizarOpcion(i, e.target.value)}
            className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
          />
        ))}
        <button
          type="button"
          onClick={() => setOpciones((prev) => [...prev, ""])}
          className="self-start text-sm font-medium text-bosque-700 underline-offset-2 hover:underline"
        >
          + Agregar opción
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-bosque-700">Fecha de cierre (opcional)</label>
        <input
          type="date"
          value={fechaCierre}
          onChange={(e) => setFechaCierre(e.target.value)}
          className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
      </div>

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Creando…" : "Crear votación"}
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
