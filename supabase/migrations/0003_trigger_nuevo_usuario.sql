-- Al crear una cuenta en Supabase Auth (Google u email/password), se crea
-- automáticamente su fila en `usuarios` (rol Parcelero por defecto) y una
-- fila vacía en `perfiles`, lista para completarse en el onboarding.

create or replace function manejar_nuevo_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  rol_parcelero_id uuid;
begin
  select id into rol_parcelero_id from roles where nombre = 'Parcelero';

  insert into usuarios (id, email, rol_id)
  values (new.id, new.email, rol_parcelero_id)
  on conflict (id) do nothing;

  insert into perfiles (usuario_id, nombre)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (usuario_id) do nothing;

  return new;
end;
$$;

create trigger trg_nuevo_usuario
  after insert on auth.users
  for each row execute function manejar_nuevo_usuario();
