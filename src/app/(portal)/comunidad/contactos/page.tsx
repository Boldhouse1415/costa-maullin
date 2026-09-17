import { crearClienteServidor } from "@/lib/supabase/server";
import { obtenerUsuarioActual, tienePermiso } from "@/lib/rbac/permisos";
import { Icono } from "@/components/ui/Icono";
import { FormularioContacto } from "@/components/ui/FormularioContacto";

export default async function PaginaContactos() {
  const usuario = await obtenerUsuarioActual();
  const puedeGestionar = tienePermiso(usuario, "comunidad.gestionar_contactos");

  const supabase = await crearClienteServidor();

  const { data: contactos } = await supabase
    .from("contactos_utiles")
    .select("id, nombre, cargo, telefono, whatsapp, email, observaciones")
    .order("nombre");

  return (
    <div className="flex flex-col gap-4 px-5 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-bosque-900">Contactos útiles</h1>
        {puedeGestionar && <FormularioContacto />}
      </div>
      <p className="text-sm text-bosque-500">
        Administración, emergencias, electricidad, agua y mantención.
      </p>

      {contactos && contactos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {contactos.map((c) => (
            <div key={c.id} className="tarjeta flex flex-col gap-1 p-4">
              <p className="font-medium text-bosque-900">{c.nombre}</p>
              {c.cargo && <p className="text-sm text-bosque-500">{c.cargo}</p>}
              {c.observaciones && <p className="text-sm text-bosque-500">{c.observaciones}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                {c.telefono && (
                  <a
                    href={`tel:${c.telefono}`}
                    className="rounded-full bg-bosque-500 px-3 py-1.5 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
                  >
                    Llamar
                  </a>
                )}
                {c.whatsapp && (
                  <a
                    href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-bosque-700 px-3 py-1.5 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
                  >
                    WhatsApp
                  </a>
                )}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="rounded-full bg-bosque-500 px-3 py-1.5 text-xs font-medium text-arena-100 transition hover:bg-bosque-900"
                  >
                    Correo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tarjeta flex flex-col items-center gap-2 p-8 text-center text-bosque-500">
          <Icono nombre="contactos" className="h-8 w-8 text-bosque-500" />
          <p className="text-sm">Todavía no hay contactos registrados.</p>
        </div>
      )}
    </div>
  );
}
