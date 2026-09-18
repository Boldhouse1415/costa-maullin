"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { SelectorArchivo } from "./SelectorArchivo";

export function FormularioFotoPerfil({ usuarioId }: { usuarioId: string }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function subir(archivos: FileList | null) {
    const archivo = archivos?.[0];
    if (!archivo) return;

    setError(null);
    setEnviando(true);

    const ruta = `perfiles/${usuarioId}-${Date.now()}-${archivo.name}`;
    const { error: errorSubida } = await supabase.storage.from("adjuntos").upload(ruta, archivo);

    if (errorSubida) {
      setEnviando(false);
      setError("No se pudo subir la foto. Intenta nuevamente.");
      return;
    }

    const { data: publica } = supabase.storage.from("adjuntos").getPublicUrl(ruta);

    const { error: errorUpdate } = await supabase
      .from("perfiles")
      .update({ foto_url: publica.publicUrl })
      .eq("usuario_id", usuarioId);

    setEnviando(false);

    if (errorUpdate) {
      setError("No se pudo guardar la foto. Intenta nuevamente.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <SelectorArchivo
        label={enviando ? "Subiendo…" : "Cambiar foto"}
        accept="image/*"
        capture="user"
        onChange={subir}
      />
      {error && <p className="text-xs text-rojo-semaforo">{error}</p>}
    </div>
  );
}
