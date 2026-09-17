"use client";

import { useState } from "react";

function copiarConFallback(valor: string): boolean {
  try {
    const area = document.createElement("textarea");
    area.value = valor;
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    const exito = document.execCommand("copy");
    document.body.removeChild(area);
    return exito;
  } catch {
    return false;
  }
}

export function BotonCopiar({ valor, etiqueta = "Copiar" }: { valor: string; etiqueta?: string }) {
  const [estado, setEstado] = useState<"idle" | "copiado" | "error">("idle");

  async function copiar() {
    let exito = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(valor);
        exito = true;
      } catch {
        exito = false;
      }
    }

    if (!exito) {
      exito = copiarConFallback(valor);
    }

    setEstado(exito ? "copiado" : "error");
    setTimeout(() => setEstado("idle"), 2000);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium text-arena-100 transition ${
        estado === "error" ? "bg-rojo-semaforo" : "bg-bosque-500 hover:bg-bosque-900"
      }`}
    >
      {estado === "copiado" ? "¡Copiado!" : estado === "error" ? "No se pudo copiar" : etiqueta}
    </button>
  );
}
