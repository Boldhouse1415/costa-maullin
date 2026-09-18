"use client";

function celda(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
}

export function BotonExportarCSV({
  nombreArchivo,
  encabezados,
  filas,
  etiqueta = "Exportar CSV",
}: {
  nombreArchivo: string;
  encabezados: string[];
  filas: (string | number | null)[][];
  etiqueta?: string;
}) {
  function exportar() {
    const lineas = [encabezados.map(celda).join(","), ...filas.map((f) => f.map(celda).join(","))];
    // BOM para que Excel reconozca UTF-8 (tildes, ñ) al abrir el archivo.
    const contenido = "﻿" + lineas.join("\r\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportar}
      className="flex items-center justify-center gap-2 rounded-full bg-bosque-500 px-4 py-2.5 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
    >
      {etiqueta}
    </button>
  );
}
