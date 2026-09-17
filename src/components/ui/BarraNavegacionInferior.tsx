"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icono } from "./Icono";

const destinos = [
  { href: "/inicio", etiqueta: "Inicio", icono: "inicio" as const },
  { href: "/mi-parcela", etiqueta: "Parcela", icono: "parcela" as const },
  { href: "/reportar", etiqueta: "Reportar", icono: "reportar" as const, destacado: true },
  { href: "/comunidad", etiqueta: "Comunidad", icono: "comunidad" as const },
  { href: "/perfil", etiqueta: "Perfil", icono: "perfil" as const },
];

export function BarraNavegacionInferior() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-arena-300 bg-arena-100/95 backdrop-blur sm:hidden">
      <ul className="flex items-stretch justify-between px-2">
        {destinos.map((d) => {
          const activo = pathname?.startsWith(d.href);
          return (
            <li key={d.href} className="flex-1">
              <Link
                href={d.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                  d.destacado
                    ? "-mt-4"
                    : activo
                      ? "text-bosque-900 font-medium"
                      : "text-bosque-500"
                }`}
              >
                <span
                  className={
                    d.destacado
                      ? "flex h-12 w-12 items-center justify-center rounded-full bg-bosque-700 text-arena-100 shadow-lg"
                      : ""
                  }
                >
                  <Icono nombre={d.icono} className={d.destacado ? "h-6 w-6" : "h-5 w-5"} />
                </span>
                {d.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
