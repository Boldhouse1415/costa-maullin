"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const destinos = [
  { href: "/inicio", etiqueta: "Inicio", icono: "🏠" },
  { href: "/mi-parcela", etiqueta: "Parcela", icono: "🌲" },
  { href: "/reportar", etiqueta: "Reportar", icono: "📍", destacado: true },
  { href: "/comunidad", etiqueta: "Comunidad", icono: "💬" },
  { href: "/perfil", etiqueta: "Perfil", icono: "👤" },
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
                      ? "flex h-12 w-12 items-center justify-center rounded-full bg-bosque-700 text-xl text-arena-100 shadow-lg"
                      : "text-lg"
                  }
                >
                  {d.icono}
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
