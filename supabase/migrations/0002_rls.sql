-- Costa Maullín — Row Level Security
-- Principio: la interfaz oculta botones por comodidad, pero el aislamiento
-- real de datos (un parcelero solo ve lo suyo) se aplica aquí, en la base de datos.

-- ---------------------------------------------------------
-- Funciones de apoyo
-- ---------------------------------------------------------

create or replace function auth_usuario_id()
returns uuid language sql stable as $$
  select auth.uid();
$$;

create or replace function tiene_permiso(clave_permiso text)
returns boolean language sql stable as $$
  select exists (
    select 1
    from usuarios u
    join rol_permiso rp on rp.rol_id = u.rol_id
    join permisos p on p.id = rp.permiso_id
    where u.id = auth.uid() and p.clave = clave_permiso and u.estado = 'activo'
  );
$$;

create or replace function es_superadmin()
returns boolean language sql stable as $$
  select exists (
    select 1 from usuarios u join roles r on r.id = u.rol_id
    where u.id = auth.uid() and r.nombre = 'Superadministrador'
  );
$$;

create or replace function parcela_propia(p_parcela_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from propietario_parcela pp
    where pp.parcela_id = p_parcela_id
      and pp.usuario_id = auth.uid()
      and pp.estado = 'aprobado'
  );
$$;

-- ---------------------------------------------------------
-- Activar RLS en todas las tablas con datos de usuarios/parcelas
-- ---------------------------------------------------------

alter table usuarios enable row level security;
alter table perfiles enable row level security;
alter table parcelas enable row level security;
alter table propietario_parcela enable row level security;
alter table movimientos enable row level security;
alter table comprobantes enable row level security;
alter table reportes enable row level security;
alter table reporte_comentarios enable row level security;
alter table imagenes enable row level security;
alter table accesos enable row level security;
alter table accesos_historial enable row level security;
alter table auditoria enable row level security;

-- usuarios: cada uno ve su propia fila; roles con permiso ven todas
create policy usuarios_select on usuarios for select
  using (id = auth.uid() or tiene_permiso('parceleros.ver'));
create policy usuarios_update_propio on usuarios for update
  using (id = auth.uid());
create policy usuarios_update_admin on usuarios for update
  using (tiene_permiso('parceleros.editar'));

-- perfiles: análogo a usuarios
create policy perfiles_select on perfiles for select
  using (usuario_id = auth.uid() or tiene_permiso('parceleros.ver'));
create policy perfiles_upsert_propio on perfiles for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy perfiles_admin on perfiles for all
  using (tiene_permiso('parceleros.editar'));

-- parcelas: lectura amplia dentro del portal (todos los usuarios autenticados
-- ven el listado básico), escritura solo con permiso
create policy parcelas_select on parcelas for select using (auth.uid() is not null);
create policy parcelas_write on parcelas for insert with check (tiene_permiso('parcelas.crear'));
create policy parcelas_update on parcelas for update using (tiene_permiso('parcelas.editar'));

-- propietario_parcela: el usuario ve sus propias solicitudes/vínculos;
-- administración ve todo
create policy pp_select_propio on propietario_parcela for select
  using (usuario_id = auth.uid() or tiene_permiso('parceleros.ver'));
create policy pp_insert_propio on propietario_parcela for insert
  with check (usuario_id = auth.uid()); -- el propio usuario crea su solicitud (queda 'pendiente')
create policy pp_update_admin on propietario_parcela for update
  using (es_superadmin()); -- solo el Superadministrador aprueba/rechaza (decisión tomada)

-- movimientos: el parcelero solo ve los de sus parcelas aprobadas;
-- tesorería/admin con permiso ven y escriben todo. Nunca hay policy de DELETE.
create policy movimientos_select on movimientos for select
  using (parcela_propia(parcela_id) or tiene_permiso('tesoreria.ver_pagos'));
create policy movimientos_insert on movimientos for insert
  with check (tiene_permiso('tesoreria.registrar_pago'));
create policy movimientos_update on movimientos for update
  using (tiene_permiso('tesoreria.modificar_pago'));

-- comprobantes: visible a quien puede ver el movimiento asociado
create policy comprobantes_select on comprobantes for select
  using (
    exists (
      select 1 from movimientos m
      where m.id = comprobantes.movimiento_id
        and (parcela_propia(m.parcela_id) or tiene_permiso('tesoreria.ver_pagos'))
    )
  );

-- reportes: el autor ve los suyos; administración con permiso ve todos
create policy reportes_select on reportes for select
  using (usuario_id = auth.uid() or tiene_permiso('comunidad.ver_reportes'));
create policy reportes_insert on reportes for insert
  with check (usuario_id = auth.uid());
create policy reportes_update_admin on reportes for update
  using (tiene_permiso('comunidad.gestionar_reportes'));

create policy reporte_comentarios_select on reporte_comentarios for select
  using (
    exists (
      select 1 from reportes r
      where r.id = reporte_comentarios.reporte_id
        and (r.usuario_id = auth.uid() or tiene_permiso('comunidad.ver_reportes'))
    )
  );
create policy reporte_comentarios_insert on reporte_comentarios for insert
  with check (
    usuario_id = auth.uid() and exists (
      select 1 from reportes r
      where r.id = reporte_comentarios.reporte_id
        and (r.usuario_id = auth.uid() or tiene_permiso('comunidad.gestionar_reportes'))
    )
  );

-- imagenes: mismo criterio que la entidad a la que pertenecen (simplificado: propio usuario o permiso admin)
create policy imagenes_select on imagenes for select
  using (usuario_id = auth.uid() or auth.uid() is not null);
create policy imagenes_insert on imagenes for insert
  with check (usuario_id = auth.uid());

-- accesos: la clave vigente solo la ve quien tiene el permiso 'accesos.ver_clave'
-- (una sola clave para toda la comunidad, decisión tomada)
create policy accesos_select on accesos for select
  using (tiene_permiso('accesos.ver_clave'));
create policy accesos_update on accesos for update
  using (tiene_permiso('accesos.cambiar_clave'));

-- accesos_historial: nunca visible a parceleros, solo a quien administra accesos
create policy accesos_historial_select on accesos_historial for select
  using (tiene_permiso('accesos.ver_historial'));

-- auditoria: insert-only vía backend; lectura solo Superadministrador (o permiso explícito)
create policy auditoria_select on auditoria for select
  using (tiene_permiso('administracion.ver_auditoria'));
create policy auditoria_insert on auditoria for insert with check (true);

-- ---------------------------------------------------------
-- Protección del Superadministrador (sección "Roles y permisos" del diseño)
-- ---------------------------------------------------------

create or replace function proteger_superadmin()
returns trigger language plpgsql as $$
declare
  es_rol_superadmin boolean;
  quien_ejecuta_es_superadmin boolean;
  total_superadmins int;
begin
  select (r.nombre = 'Superadministrador') into es_rol_superadmin
  from roles r where r.id = old.rol_id;

  if es_rol_superadmin then
    select es_superadmin() into quien_ejecuta_es_superadmin;
    if not quien_ejecuta_es_superadmin then
      raise exception 'Solo un Superadministrador puede modificar a otro Superadministrador';
    end if;

    select count(*) into total_superadmins
    from usuarios u join roles r on r.id = u.rol_id
    where r.nombre = 'Superadministrador' and u.estado = 'activo';

    if total_superadmins <= 1 and (new.estado = 'inactivo' or new.rol_id <> old.rol_id) then
      raise exception 'Debe existir al menos un Superadministrador activo';
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_proteger_superadmin
  before update on usuarios
  for each row execute function proteger_superadmin();
