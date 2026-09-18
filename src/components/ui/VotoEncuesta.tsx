"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function VotoEncuesta({
  encuestaId,
  opciones,
  votoActualId,
}: {
  encuestaId: string;
  opciones: { id: string; texto: string }[];
  votoActualId: string | null;
}) {
  const [seleccion, setSeleccion] = useState(votoActualId ?? "");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function votar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!seleccion) {
      setError("Elige una opción para votar.");
      return;
    }

    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: errorVoto } = await supabase.from("encuesta_votos").upsert(
      {
        encuesta_id: encuestaId,
        opcion_id: seleccion,
        usuario_id: user?.id,
      },
      { onConflict: "encuesta_id,usuario_id" },
    );

    setEnviando(false);

    if (errorVoto) {
      setError("No se pudo registrar tu voto. Intenta nuevamente.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={votar} className="tarjeta flex flex-col gap-3 p-4">
      <p className="text-sm font-medium text-bosque-900">
        {votoActualId ? "Puedes cambiar tu voto mientras esté abierta" : "Elige tu opción"}
      </p>
      <div className="flex flex-col gap-2">
        {opciones.map((o) => (
          <label
            key={o.id}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
              seleccion === o.id
                ? "border-bosque-700 bg-bosque-300/20"
                : "border-arena-300 bg-white"
            }`}
          >
            <input
              type="radio"
              name="opcion"
              value={o.id}
              checked={seleccion === o.id}
              onChange={() => setSeleccion(o.id)}
              className="h-4 w-4"
            />
            {o.texto}
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
      >
        {enviando ? "Enviando…" : votoActualId ? "Actualizar voto" : "Votar"}
      </button>
    </form>
  );
}
