import { Icono } from "@/components/ui/Icono";

const secciones = [
  { href: "/comunidad/noticias", label: "Noticias", icono: "noticias" as const },
  { href: "/comunidad/mapa", label: "Mapa de parcelas", icono: "mapa" as const },
  { href: "/comunidad/acceso", label: "Acceso", icono: "acceso" as const },
  { href: "/comunidad/contactos", label: "Contactos útiles", icono: "contactos" as const },
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
            className="tarjeta flex flex-col items-center gap-2 p-5 text-center text-sm text-bosque-700"
          >
            <Icono nombre={s.icono} className="h-7 w-7 text-bosque-700" />
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
