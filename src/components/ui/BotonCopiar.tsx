"use client";

import { useState } from "react";

export function BotonCopiar({ valor, etiqueta = "Copiar" }: { valor: string; etiqueta?: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Si el navegador bloquea el portapapeles, no hacemos nada más.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="rounded-full border border-arena-300 px-3 py-1 text-xs font-medium text-bosque-700 transition hover:bg-arena-200"
    >
      {copiado ? "¡Copiado!" : etiqueta}
    </button>
  );
}
