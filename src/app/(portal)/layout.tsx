import Image from "next/image";
import Link from "next/link";
import { Icono } from "@/components/ui/Icono";
import { BarraNavegacionInferior } from "@/components/ui/BarraNavegacionInferior";

const destinos = [
  { href: "/inicio", etiqueta: "Inicio", icono: "inicio" as const },
  { href: "/mi-parcela", etiqueta: "Mi Parcela", icono: "parcela" as const },
  { href: "/reportar", etiqueta: "Reportar", icono: "reportar" as const },
  { href: "/comunidad", etiqueta: "Comunidad", icono: "comunidad" as const },
  { href: "/pagos", etiqueta: "Pagos", icono: "pagos" as const },
  { href: "/perfil", etiqueta: "Perfil", icono: "perfil" as const },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-arena-100">
      <header className="border-b border-arena-300 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/inicio" className="flex shrink-0 items-center">
            <Image
              src="/logo-costa-maullin.png"
              alt="Costa Maullín — Ir al inicio"
              width={2070}
              height={760}
              priority
              className="h-14 w-auto sm:h-20"
            />
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-bosque-700 sm:flex">
            {destinos.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="flex items-center gap-1.5 transition hover:text-bosque-900"
              >
                <Icono nombre={d.icono} className="h-4 w-4" />
                {d.etiqueta}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 pb-24 sm:pb-8">{children}</main>
      <BarraNavegacionInferior />
    </div>
  );
}
