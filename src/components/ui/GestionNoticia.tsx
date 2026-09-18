"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { SelectorArchivo } from "./SelectorArchivo";

type Aviso = {
  id: string;
  titulo: string;
  texto: string;
  importancia: string | null;
  foto_url: string | null;
};

export function GestionNoticia({ aviso }: { aviso: Aviso }) {
  const [modo, setModo] = useState<"ver" | "editar" | "eliminar">("ver");
  const [titulo, setTitulo] = useState(aviso.titulo);
  const [texto, setTexto] = useState(aviso.texto);
  const [importante, setImportante] = useState(aviso.importancia === "alta");
  const [foto, setFoto] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!titulo || !texto) {
      setError("Completa el título y el texto de la noticia.");
      return;
    }

    setEnviando(true);

    let foto_url = aviso.foto_url;

    if (foto) {
      const ruta = `avisos/${Date.now()}-${foto.name}`;
      const { error: errorSubida } = await supabase.storage.from("adjuntos").upload(ruta, foto);

      if (errorSubida) {
        setEnviando(false);
        setError("No se pudo subir la nueva foto. Intenta nuevamente.");
        return;
      }

      const { data: publica } = supabase.storage.from("adjuntos").getPublicUrl(ruta);
      foto_url = publica.publicUrl;
    }

    const { error: errorUpdate } = await supabase
      .from("avisos")
      .update({
        titulo,
        texto,
        importancia: importante ? "alta" : "normal",
        foto_url,
      })
      .eq("id", aviso.id);

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

    const { error: errorDelete } = await supabase.from("avisos").delete().eq("id", aviso.id);

    setEnviando(false);

    if (errorDelete) {
      setError("No se pudo eliminar la noticia. Intenta nuevamente.");
      return;
    }

    router.refresh();
  }

  if (modo === "eliminar") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl bg-rojo-semaforo/10 p-3">
        <p className="text-sm text-bosque-900">¿Eliminar esta noticia? No se puede deshacer.</p>
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
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="h-10 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
        <textarea
          required
          placeholder="Texto de la noticia"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          className="rounded-xl border border-arena-300 bg-white px-3 py-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
        />
        <SelectorArchivo
          label="Cambiar foto (opcional)"
          accept="image/*"
          onChange={(archivos) => setFoto(archivos?.[0] ?? null)}
        />
        <label className="flex items-center gap-2 text-sm text-bosque-700">
          <input
            type="checkbox"
            checked={importante}
            onChange={(e) => setImportante(e.target.checked)}
            className="h-4 w-4 rounded border-arena-300"
          />
          Marcar como importante
        </label>
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
