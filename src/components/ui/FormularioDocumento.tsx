"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export function FormularioDocumento({
  categorias,
}: {
  categorias: { id: string; nombre: string }[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? "");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = crearClienteNavegador();

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!archivo) {
      setError("Selecciona un archivo.");
      return;
    }

    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const ruta = `documentos/${Date.now()}-${archivo.name}`;
    const { error: errorSubida } = await supabase.storage.from("adjuntos").upload(ruta, archivo);

    if (errorSubida) {
      setEnviando(false);
      setError("No se pudo subir el archivo. Intenta nuevamente.");
      return;
    }

    const { data: publica } = supabase.storage.from("adjuntos").getPublicUrl(ruta);

    const { error: errorInsert } = await supabase.from("documentos").insert({
      nombre,
      categoria_id: categoriaId || null,
      descripcion: descripcion || null,
      archivo_url: publica.publicUrl,
      usuario_id: user?.id ?? null,
    });

    setEnviando(false);

    if (errorInsert) {
      setError("No se pudo guardar el documento. Intenta nuevamente.");
      return;
    }

    setNombre("");
    setDescripcion("");
    setArchivo(null);
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
        + Subir documento
      </button>
    );
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-3 p-4">
      <input
        type="text"
        required
        placeholder="Nombre del documento"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="h-11 rounded-xl border border-arena-300 bg-white px-3 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
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
      <textarea
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={2}
        className="rounded-xl border border-arena-300 bg-white px-3 py-2 text-sm text-bosque-900 outline-none focus:border-bosque-500"
      />
      <input
        type="file"
        required
        onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
        className="text-xs text-bosque-500 file:mr-3 file:rounded-full file:border-0 file:bg-bosque-500 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-arena-100"
      />

      {error && <p className="text-sm text-rojo-semaforo">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 rounded-full bg-bosque-700 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 disabled:opacity-60"
        >
          {enviando ? "Subiendo…" : "Guardar documento"}
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
