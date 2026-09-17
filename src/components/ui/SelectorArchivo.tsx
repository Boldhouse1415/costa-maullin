"use client";

import { useRef, useState } from "react";

export function SelectorArchivo({
  label,
  accept,
  capture,
  multiple,
  onChange,
}: {
  label: string;
  accept?: string;
  capture?: "environment" | "user";
  multiple?: boolean;
  onChange: (archivos: FileList | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [nombres, setNombres] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={ref}
        type="file"
        accept={accept}
        capture={capture}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files);
          setNombres(e.target.files ? Array.from(e.target.files).map((f) => f.name) : []);
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="self-start rounded-full bg-bosque-500 px-4 py-2 text-sm font-medium text-arena-100 transition hover:bg-bosque-900"
      >
        {label}
      </button>
      <p className="text-xs text-bosque-500">
        {nombres.length > 0 ? nombres.join(", ") : "No se ha seleccionado ningún archivo."}
      </p>
    </div>
  );
}
