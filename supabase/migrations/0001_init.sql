-- Costa Maullín — esquema inicial
-- Convenciones: snake_case, uuid como PK, timestamps con zona horaria,
-- nunca se borran movimientos financieros (solo se agregan ajustes).

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. ROLES Y PERMISOS (RBAC data-driven)
-- =========================================================

create table roles (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  es_sistema boolean not null default false, -- true protege al rol de ser borrado (ej. Superadministrador)
  created_at timestamptz not null default now()
);

create table permisos (
  id uuid primary key default gen_random_uuid(),
  modulo text not null,           -- ej. 'parcelas', 'tesoreria', 'parceleros', 'comunidad', 'accesos', 'administracion'
  accion text not null,           -- ej. 'ver', 'crear', 'editar', 'desactivar', 'registrar_pago'
  clave text not null unique,     -- ej. 'tesoreria.registrar_pago'
  descripcion text
);

create table rol_permiso (
  rol_id uuid not null references roles(id) on delete cascade,
  permiso_id uuid not null references permisos(id) on delete cascade,
  primary key (rol_id, permiso_id)
);

-- =========================================================
-- 2. USUARIOS Y PERFILES
-- =========================================================
-- `usuarios` extiende auth.users (Supabase Auth) 1:1.

create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  rol_id uuid not null references roles(id),
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now()
);

create table perfiles (
  usuario_id uuid primary key references usuarios(id) on delete cascade,
  nombre text,
  apellidos text,
  rut text,
  telefono text,
  whatsapp text,
  segundo_contacto_nombre text,
  segundo_contacto_telefono text,
  segundo_contacto_email text,
  contacto_emergencia text,
  foto_url text,
  observaciones text,
  compartir_en_directorio boolean not null default false,
  directorio_campos jsonb not null default '{"foto":true,"nombre":true,"parcela":true,"whatsapp":false,"email":false}',
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 3. PARCELAS Y RELACIÓN PROPIETARIO-PARCELA
-- =========================================================

create table parcelas (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,
  estado_construccion text not null default 'sin_construir'
    check (estado_construccion in ('sin_construir', 'en_construccion', 'construida')),
  medidor_electrico boolean default false,
  numero_medidor_electrico text,
  medidor_agua boolean default false,
  numero_medidor_agua text,
  poste_electrico boolean default false,
  empalme_electrico boolean default false,
  conexion_agua boolean default false,
  fecha_construccion date,
  observaciones text,
  foto_principal_url text,
  metadata jsonb not null default '{}', -- campos futuros sin migrar el esquema
  created_at timestamptz not null default now()
);

-- Resuelve "una persona, varias parcelas" y "una parcela, varios propietarios",
-- y el flujo de solicitud/aprobación de vinculación.
create table propietario_parcela (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  parcela_id uuid not null references parcelas(id) on delete cascade,
  rol_relacion text not null default 'propietario', -- propietario | contacto
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  solicitado_en timestamptz not null default now(),
  resuelto_en timestamptz,
  resuelto_por uuid references usuarios(id),
  unique (usuario_id, parcela_id)
);

-- =========================================================
-- 4. TESORERÍA: CONCEPTOS, MOVIMIENTOS, COMPROBANTES
-- =========================================================

create table conceptos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null default 'cuota_ordinaria'
    check (tipo in ('cuota_ordinaria', 'cuota_extraordinaria', 'aporte', 'abono', 'ajuste', 'otro')),
  activo boolean not null default true
);

create table movimientos (
  id uuid primary key default gen_random_uuid(),
  parcela_id uuid not null references parcelas(id),
  concepto_id uuid not null references conceptos(id),
  periodo text not null,                 -- ej. '2025-03'
  monto_cuota numeric(12,2) not null,
  fecha_emision date not null,
  fecha_vencimiento date,
  monto_pagado numeric(12,2) not null default 0,
  fecha_pago date,
  medio_pago text,                       -- catálogo abierto: 'transferencia', 'efectivo', 'deposito', 'otro'
  estado text not null default 'pendiente'
    check (estado in ('pagado', 'pendiente', 'vencido', 'pago_parcial', 'ajuste_exento')),
  observaciones text,
  ajusta_movimiento_id uuid references movimientos(id), -- si es un ajuste, referencia al movimiento original
  usuario_registro_id uuid references usuarios(id),
  created_at timestamptz not null default now()
  -- Nunca se hace DELETE sobre esta tabla desde la aplicación: las correcciones
  -- se registran como un nuevo movimiento de concepto 'ajuste'.
);

create table comprobantes (
  id uuid primary key default gen_random_uuid(),
  movimiento_id uuid not null references movimientos(id),
  numero bigserial,
  pdf_url text,
  fecha_emision timestamptz not null default now()
);

-- =========================================================
-- 5. CALENDARIO, AVISOS, DOCUMENTOS, CONTACTOS
-- =========================================================

create table categorias_evento (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  fecha date not null,
  hora time,
  categoria_id uuid references categorias_evento(id),
  lugar text,
  responsable text,
  archivo_url text,
  usuario_id uuid references usuarios(id),
  created_at timestamptz not null default now()
);

create table avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  texto text not null,
  fecha timestamptz not null default now(),
  foto_url text,
  documento_url text,
  importancia text not null default 'normal' check (importancia in ('normal', 'alta')),
  destacado_hasta date,
  origen_reporte_id uuid, -- fk agregada más abajo tras crear `reportes`
  usuario_id uuid references usuarios(id)
);

create table categorias_documento (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table documentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria_id uuid references categorias_documento(id),
  fecha date not null default current_date,
  descripcion text,
  archivo_url text not null,
  usuario_id uuid references usuarios(id)
);

create table contactos_utiles (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cargo text,
  telefono text,
  whatsapp text,
  email text,
  observaciones text
);

-- =========================================================
-- 6. ACCESO / CANDADO (una sola clave para toda la comunidad)
-- =========================================================

create table accesos (
  id uuid primary key default gen_random_uuid(),
  clave_actual_hash text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references usuarios(id)
);

create table accesos_historial (
  id uuid primary key default gen_random_uuid(),
  acceso_id uuid not null references accesos(id),
  fecha_cambio timestamptz not null default now(),
  usuario_id uuid references usuarios(id)
  -- Nunca se guarda la clave anterior en texto plano ni se expone a parceleros.
);

-- =========================================================
-- 7. REPORTES DE LA COMUNIDAD
-- =========================================================

create table reportes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id),
  parcela_id uuid references parcelas(id),
  categoria text not null,
  foto_urls text[] not null default '{}',
  audio_url text,
  comentario text,
  estado text not null default 'recibido'
    check (estado in ('recibido', 'en_revision', 'en_proceso', 'resuelto', 'cerrado')),
  created_at timestamptz not null default now()
);

alter table avisos
  add constraint avisos_origen_reporte_fk foreign key (origen_reporte_id) references reportes(id);

create table reporte_comentarios (
  id uuid primary key default gen_random_uuid(),
  reporte_id uuid not null references reportes(id) on delete cascade,
  usuario_id uuid not null references usuarios(id),
  texto text,
  foto_url text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 8. IMÁGENES (tabla genérica, referencia polimórfica)
-- =========================================================

create table imagenes (
  id uuid primary key default gen_random_uuid(),
  entidad_tipo text not null, -- 'perfil' | 'parcela' | 'reporte'
  entidad_id uuid not null,
  url text not null,
  usuario_id uuid references usuarios(id),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 9. AUDITORÍA (insert-only)
-- =========================================================

create table auditoria (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id),
  rol_al_momento text,
  accion text not null,
  entidad_tipo text,
  entidad_id uuid,
  detalle jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 10. CONFIGURACIÓN GENERAL (reglas de negocio fuera del código)
-- =========================================================

create table configuracion (
  clave text primary key,
  valor jsonb not null
);

insert into configuracion (clave, valor) values
  ('nombre_comunidad', '"Costa Maullín"'),
  ('semaforo_dias_amarillo', '7'),
  ('estado_general', '{"nivel":"verde","titulo":"Todo normal","descripcion":null,"fecha_normalizacion":null}');
