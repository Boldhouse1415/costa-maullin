import { Icono } from "@/components/ui/Icono";

const secciones = [
  { href: "/comunidad/noticias", label: "Noticias", icono: "noticias" as const, color: "bg-bosque-700" },
  { href: "/comunidad/mapa", label: "Mapa de parcelas", icono: "mapa" as const, color: "bg-bosque-500" },
  { href: "/comunidad/acceso", label: "Acceso", icono: "acceso" as const, color: "bg-bosque-500" },
  { href: "/comunidad/contactos", label: "Contactos útiles", icono: "contactos" as const, color: "bg-bosque-700" },
  { href: "/comunidad/documentos", label: "Documentos", icono: "documentos" as const, color: "bg-bosque-500" },
];

export default function PaginaComunidad() {
  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <h1 className="text-xl font-semibold text-bosque-900">Comunidad</h1>
      <p className="text-sm text-bosque-500">
        Noticias, mapa de vecinos, acceso y contactos útiles de Costa Maullín.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {secciones.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className={`flex flex-col items-center gap-2 rounded-2xl p-5 text-center text-sm font-medium text-arena-100 transition hover:brightness-110 ${s.color}`}
          >
            <Icono nombre={s.icono} className="h-7 w-7 text-arena-100" />
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
