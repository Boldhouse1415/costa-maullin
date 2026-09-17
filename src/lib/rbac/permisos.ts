import { crearClienteServidor } from "@/lib/supabase/server";

export type UsuarioActual = {
  id: string;
  email: string;
  rol: string;
  permisos: string[];
  perfil: {
    nombre: string | null;
    apellidos: string | null;
    fotoUrl: string | null;
  } | null;
};

/**
 * Trae el usuario autenticado junto a su rol y el listado plano de claves
 * de permiso (ej. "tesoreria.registrar_pago"). Se usa en Server Components
 * y layouts para decidir qué mostrar — la seguridad real de los datos la
 * aplican las políticas RLS en la base de datos, esto es solo para UI.
 */
export async function obtenerUsuarioActual(): Promise<UsuarioActual | null> {
  const supabase = await crearClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id, email, roles(nombre, rol_permiso(permisos(clave)))")
    .eq("id", user.id)
    .single();

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, apellidos, foto_url")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!usuario) return null;

  // El shape exacto que entrega supabase-js para relaciones anidadas puede
  // variar entre "objeto" y "arreglo" según la versión; se normaliza aquí.
  const rolRel: any = (usuario as any).roles;
  const rol = Array.isArray(rolRel) ? rolRel[0] : rolRel;
  const permisos: string[] = (rol?.rol_permiso ?? [])
    .map((rp: any) => rp.permisos?.clave)
    .filter(Boolean);

  return {
    id: usuario.id,
    email: usuario.email,
    rol: rol?.nombre ?? "Parcelero",
    permisos,
    perfil: perfil
      ? { nombre: perfil.nombre, apellidos: perfil.apellidos, fotoUrl: perfil.foto_url }
      : null,
  };
}

export function tienePermiso(usuario: UsuarioActual | null, clave: string): boolean {
  if (!usuario) return false;
  if (usuario.rol === "Superadministrador") return true;
  return usuario.permisos.includes(clave);
}
