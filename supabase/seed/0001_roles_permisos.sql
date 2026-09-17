-- Costa Maullín — roles y permisos iniciales
-- Ejecutar después de las migraciones. Idempotente (usa ON CONFLICT).

-- 1. Roles
insert into roles (nombre, es_sistema) values
  ('Superadministrador', true),
  ('Administrador', false),
  ('Tesorera', false),
  ('Parcelero', false)
on conflict (nombre) do nothing;

-- 2. Catálogo de permisos (módulo.acción)
insert into permisos (modulo, accion, clave, descripcion) values
  ('parcelas', 'ver', 'parcelas.ver', 'Ver el listado y fichas de parcelas'),
  ('parcelas', 'crear', 'parcelas.crear', 'Crear nuevas parcelas'),
  ('parcelas', 'editar', 'parcelas.editar', 'Editar datos de una parcela'),
  ('parcelas', 'desactivar', 'parcelas.desactivar', 'Desactivar una parcela'),

  ('tesoreria', 'ver_pagos', 'tesoreria.ver_pagos', 'Ver pagos y estado de deuda de cualquier parcela'),
  ('tesoreria', 'registrar_pago', 'tesoreria.registrar_pago', 'Registrar cuotas y pagos'),
  ('tesoreria', 'modificar_pago', 'tesoreria.modificar_pago', 'Modificar/ajustar movimientos financieros'),
  ('tesoreria', 'generar_comprobante', 'tesoreria.generar_comprobante', 'Generar comprobantes de pago'),
  ('tesoreria', 'exportar_reportes', 'tesoreria.exportar_reportes', 'Exportar reportes financieros (Excel/PDF)'),

  ('parceleros', 'ver', 'parceleros.ver', 'Ver datos de usuarios/parceleros'),
  ('parceleros', 'editar', 'parceleros.editar', 'Editar datos de usuarios/parceleros'),
  ('parceleros', 'crear', 'parceleros.crear', 'Crear usuarios/parceleros'),
  ('parceleros', 'desactivar', 'parceleros.desactivar', 'Desactivar usuarios/parceleros'),

  ('comunidad', 'gestionar_avisos', 'comunidad.gestionar_avisos', 'Crear/editar avisos'),
  ('comunidad', 'gestionar_calendario', 'comunidad.gestionar_calendario', 'Administrar el calendario comunitario'),
  ('comunidad', 'gestionar_documentos', 'comunidad.gestionar_documentos', 'Administrar documentos'),
  ('comunidad', 'gestionar_contactos', 'comunidad.gestionar_contactos', 'Administrar contactos útiles'),
  ('comunidad', 'ver_reportes', 'comunidad.ver_reportes', 'Ver reportes de la comunidad'),
  ('comunidad', 'gestionar_reportes', 'comunidad.gestionar_reportes', 'Responder y cambiar estado de reportes'),
  ('comunidad', 'estado_general', 'comunidad.estado_general', 'Cambiar el estado general de Costa Maullín'),

  ('accesos', 'ver_clave', 'accesos.ver_clave', 'Ver la clave vigente del candado'),
  ('accesos', 'cambiar_clave', 'accesos.cambiar_clave', 'Cambiar la clave del candado'),
  ('accesos', 'ver_historial', 'accesos.ver_historial', 'Ver el historial de cambios de clave'),

  ('administracion', 'crear_administradores', 'administracion.crear_administradores', 'Crear administradores'),
  ('administracion', 'crear_roles', 'administracion.crear_roles', 'Crear y modificar roles'),
  ('administracion', 'modificar_permisos_criticos', 'administracion.modificar_permisos_criticos', 'Modificar permisos críticos'),
  ('administracion', 'ver_auditoria', 'administracion.ver_auditoria', 'Consultar auditoría'),
  ('administracion', 'modificar_configuracion', 'administracion.modificar_configuracion', 'Modificar configuración general')
on conflict (clave) do nothing;

-- 3. Matriz de permisos por defecto (según la sección "Roles y permisos" del documento)
do $$
declare
  rol_superadmin uuid := (select id from roles where nombre = 'Superadministrador');
  rol_admin uuid := (select id from roles where nombre = 'Administrador');
  rol_tesorera uuid := (select id from roles where nombre = 'Tesorera');
  rol_parcelero uuid := (select id from roles where nombre = 'Parcelero');
begin
  -- Superadministrador: todos los permisos
  insert into rol_permiso (rol_id, permiso_id)
  select rol_superadmin, id from permisos
  on conflict do nothing;

  -- Administrador: todo salvo lo reservado al Superadministrador
  insert into rol_permiso (rol_id, permiso_id)
  select rol_admin, id from permisos
  where clave not in (
    'administracion.crear_administradores',
    'administracion.crear_roles',
    'administracion.modificar_permisos_criticos'
  )
  on conflict do nothing;

  -- Tesorera: tesorería completa + lectura de parcelas/parceleros
  insert into rol_permiso (rol_id, permiso_id)
  select rol_tesorera, id from permisos
  where clave in (
    'parcelas.ver',
    'tesoreria.ver_pagos', 'tesoreria.registrar_pago', 'tesoreria.modificar_pago',
    'tesoreria.generar_comprobante', 'tesoreria.exportar_reportes',
    'parceleros.ver'
  )
  on conflict do nothing;

  -- Parcelero: sin permisos administrativos (accede a lo suyo vía RLS, no vía permisos)
end $$;

-- 4. Conceptos de cuota iniciales
insert into conceptos (nombre, tipo) values
  ('Cuota ordinaria', 'cuota_ordinaria'),
  ('Cuota extraordinaria', 'cuota_extraordinaria'),
  ('Aporte extraordinario', 'aporte'),
  ('Abono', 'abono'),
  ('Ajuste', 'ajuste')
on conflict do nothing;

-- 5. Categorías iniciales de documentos y eventos
insert into categorias_documento (nombre) values
  ('Reglamentos'), ('Actas'), ('Rendiciones'), ('Presupuestos'),
  ('Cotizaciones'), ('Planos'), ('Información técnica'), ('Otros')
on conflict do nothing;

insert into categorias_evento (nombre) values
  ('Reunión'), ('Vencimiento'), ('Mantención'), ('Camino'),
  ('Electricidad'), ('Agua'), ('Actividad'), ('Otro')
on conflict do nothing;

-- 6. Clave de acceso inicial (placeholder — cámbiala desde el panel apenas se despliegue)
insert into accesos (clave_actual_hash)
select crypt('CAMBIAR-ESTA-CLAVE', gen_salt('bf'))
where not exists (select 1 from accesos);
