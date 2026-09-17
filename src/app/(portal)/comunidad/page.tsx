import { Icono } from "@/components/ui/Icono";

const secciones = [
  { href: "/comunidad/noticias", label: "Noticias", icono: "noticias" as const },
  { href: "/comunidad/mapa", label: "Mapa de parcelas", icono: "mapa" as const },
  { href: "/comunidad/acceso", label: "Acceso", icono: "acceso" as const },
  { href: "/comunidad/contactos", label: "Contactos útiles", icono: "contactos" as const },
  { href: "/comunidad/documentos", label: "Documentos", icono: "documentos" as const },
];

export default function PaginaComunidad() {
  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <h1 className="text-xl font-semibold text-bosque-900">Comunidad</h1>
      <p className="text-sm text-bosque-500">
        Noticias, mapa de vecinos, acceso y contactos útiles de Costa Maullín.
      </p>

      <div className="flex flex-col gap-3">
        {secciones.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="tarjeta flex items-center gap-4 rounded-3xl px-5 py-4 transition hover:bg-arena-200"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bosque-300/30 text-bosque-700">
              <Icono nombre={s.icono} className="h-6 w-6" />
            </span>
            <span className="flex-1 text-base font-medium text-bosque-900">{s.label}</span>
            <Icono nombre="flecha" className="h-5 w-5 shrink-0 text-bosque-300" />
          </a>
        ))}
      </div>
    </div>
  );
}
