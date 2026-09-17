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
      className="shrink-0 rounded-full bg-bosque-500 px-4 py-2 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
    >
      {copiado ? "¡Copiado!" : etiqueta}
    </button>
  );
}
