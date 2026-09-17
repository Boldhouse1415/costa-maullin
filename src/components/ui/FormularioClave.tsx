"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function FormularioClave({ accesoId }: { accesoId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [claveNueva, setClaveNueva] = useState("");
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

    const { error: errorUpdate } = await supabase
      .from("accesos")
      .update({ clave_actual: claveNueva, updated_by: user?.id ?? null, updated_at: new Date().toISOString() })
      .eq("id", accesoId);

    if (errorUpdate) {
      setEnviando(false);
      setError("No se pudo actualizar la clave. Intenta nuevamente.");
      return;
    }

    await supabase.from("accesos_historial").insert({ acceso_id: accesoId, usuario_id: user?.id ?? null });

    setEnviando(false);
    setClaveNueva("");
    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-full bg-bosque-500 px-4 py-2 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
      >
        Cambiar clave
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-3">
      <input
        type="text"
        required
        placeholder="Nueva clave del candado"
        value={claveNueva}
        onChange={(e) => setClaveNueva(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Guardando…" : "Guardar nueva clave"}
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
