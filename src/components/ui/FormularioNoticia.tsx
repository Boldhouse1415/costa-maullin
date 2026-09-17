"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { SelectorArchivo } from "./SelectorArchivo";

export function FormularioNoticia() {
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [importante, setImportante] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let foto_url: string | null = null;

    if (foto) {
      const ruta = `avisos/${Date.now()}-${foto.name}`;
      const { error: errorSubida } = await supabase.storage
        .from("adjuntos")
        .upload(ruta, foto);

      if (errorSubida) {
        setEnviando(false);
        setError("No se pudo subir la foto. Intenta nuevamente.");
        return;
      }

      const { data: publica } = supabase.storage.from("adjuntos").getPublicUrl(ruta);
      foto_url = publica.publicUrl;
    }

    const { error } = await supabase.from("avisos").insert({
      titulo,
      texto,
      importancia: importante ? "alta" : "normal",
      foto_url,
      usuario_id: user?.id ?? null,
    });

    setEnviando(false);

    if (error) {
      setError("No se pudo publicar la noticia. Intenta nuevamente.");
      return;
    }

    setTitulo("");
    setTexto("");
    setImportante(false);
    setFoto(null);
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
        + Publicar noticia
      </button>
    );
  }

  return (
    <form onSubmit={publicar} className="tarjeta flex flex-col gap-3 p-4">
      <input
        type="text"
        required
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <textarea
        required
        placeholder="Escribe la noticia o aviso para la comunidad…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={4}
        className="rounded-xl border border-arena-300 bg-white px-3 py-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />

      <div className="flex flex-col gap-1">
        <p className="text-sm text-bosque-700">Foto (opcional) — útil para avisos obvios de mostrar</p>
        <SelectorArchivo
          label="Capturar foto"
          accept="image/*"
          capture="environment"
          onChange={(archivos) => setFoto(archivos?.[0] ?? null)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-bosque-700">
        <input
          type="checkbox"
          checked={importante}
          onChange={(e) => setImportante(e.target.checked)}
          className="h-4 w-4 rounded border-arena-300"
        />
        Marcar como importante
      </label>

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Publicando…" : "Publicar"}
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
