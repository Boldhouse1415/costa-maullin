"use client";

export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center justify-center gap-2 rounded-full bg-bosque-700 px-4 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900 print:hidden"
    >
      Imprimir / Guardar como PDF
    </button>
  );
}
