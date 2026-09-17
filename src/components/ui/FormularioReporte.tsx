"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

const CATEGORIAS = [
  "Mantención",
  "Seguridad",
  "Camino",
  "Agua",
  "Electricidad",
  "Ruido",
  "Basura",
  "Otro",
];

export function FormularioReporte() {
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [comentario, setComentario] = useState("");
  const [fotos, setFotos] = useState<FileList | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEnviando(false);
      setError("Tu sesión expiró, vuelve a iniciar sesión.");
      return;
    }

    const foto_urls: string[] = [];

    if (fotos) {
      for (const archivo of Array.from(fotos)) {
        const ruta = `reportes/${user.id}/${Date.now()}-${archivo.name}`;
        const { error: errorSubida } = await supabase.storage
          .from("adjuntos")
          .upload(ruta, archivo);
        if (errorSubida) {
          setEnviando(false);
          setError("No se pudo subir una de las fotos. Intenta nuevamente.");
          return;
        }
        const { data: publica } = supabase.storage.from("adjuntos").getPublicUrl(ruta);
        foto_urls.push(publica.publicUrl);
      }
    }

    let audio_url: string | null = null;
    if (audio) {
      const ruta = `reportes/${user.id}/${Date.now()}-${audio.name}`;
      const { error: errorAudio } = await supabase.storage
        .from("adjuntos")
        .upload(ruta, audio);
      if (errorAudio) {
        setEnviando(false);
        setError("No se pudo subir el audio. Intenta nuevamente.");
        return;
      }
      const { data: publica } = supabase.storage.from("adjuntos").getPublicUrl(ruta);
      audio_url = publica.publicUrl;
    }

    // Si el usuario tiene una parcela aprobada, la asociamos automáticamente.
    const { data: vinculo } = await supabase
      .from("propietario_parcela")
      .select("parcela_id")
      .eq("usuario_id", user.id)
      .eq("estado", "aprobado")
      .limit(1)
      .maybeSingle();

    const { error: errorInsert } = await supabase.from("reportes").insert({
      usuario_id: user.id,
      parcela_id: vinculo?.parcela_id ?? null,
      categoria,
      foto_urls,
      audio_url,
      comentario: comentario || null,
    });

    setEnviando(false);

    if (errorInsert) {
      setError("No se pudo enviar el reporte. Intenta nuevamente.");
      return;
    }

    setComentario("");
    setFotos(null);
    setAudio(null);
    setEnviado(true);
    router.refresh();
    setTimeout(() => setEnviado(false), 3000);
  }

  return (
    <form onSubmit={enviar} className="tarjeta flex flex-col gap-3 p-4">
      <label className="flex flex-col gap-1 text-sm text-bosque-700">
        Categoría
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <textarea
        placeholder="Cuéntanos qué pasó…"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={4}
        className="rounded-xl border border-arena-300 bg-white px-3 py-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />

      <label className="flex flex-col gap-1 text-sm text-bosque-700">
        Fotos (opcional)
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={(e) => setFotos(e.target.files)}
          className="text-xs text-bosque-500 file:mr-3 file:rounded-full file:border-0 file:bg-bosque-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-arena-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-bosque-700">
        Audio (opcional)
        <input
          type="file"
          accept="audio/*"
          capture="user"
          onChange={(e) => setAudio(e.target.files?.[0] ?? null)}
          className="text-xs text-bosque-500 file:mr-3 file:rounded-full file:border-0 file:bg-bosque-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-arena-100"
        />
      </label>

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}
      {enviado && <p className="text-sm text-bosque-700">¡Reporte enviado! Gracias por avisar.</p>}

      <button
        type="submit"
        disabled={enviando}
        className="h-12 rounded-full bg-bosque-700 font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Enviar reporte"}
      </button>
    </form>
  );
}
