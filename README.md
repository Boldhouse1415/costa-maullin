# Costa Maullín — Portal digital de la comunidad

Base del proyecto: autenticación, roles y permisos (RBAC), y el modelo de datos.
Construido con Next.js + TypeScript + Tailwind, y Supabase (base de datos,
autenticación y storage).

Esta guía asume que no programas — sigue los pasos en orden, uno a la vez.

## 1. Crear el proyecto en Supabase

1. Entra a https://supabase.com y crea una cuenta (puedes usar tu Google).
2. Crea un **New Project**. Elige una contraseña de base de datos y guárdala
   en un lugar seguro (no la necesitarás seguido, pero es la llave maestra).
3. Cuando el proyecto esté listo, ve a **Project Settings → API**. Ahí vas a
   ver dos datos que necesitas copiar:
   - **Project URL**
   - **anon public key**

## 2. Cargar el esquema de la base de datos

1. En el panel de Supabase, ve a **SQL Editor**.
2. Abre el archivo `supabase/migrations/0001_init.sql` de este proyecto,
   copia todo su contenido, pégalo en el SQL Editor y presiona **Run**.
3. Repite lo mismo, en orden, con:
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_trigger_nuevo_usuario.sql`
   - `supabase/seed/0001_roles_permisos.sql`

Esto crea todas las tablas (parcelas, usuarios, roles, pagos, etc.), las
reglas de seguridad, y los 4 roles iniciales (Superadministrador,
Administrador, Tesorera, Parcelero) con sus permisos ya configurados como
quedó definido en el documento de arquitectura.

## 3. Activar el login con Google (opcional pero recomendado)

1. En Supabase: **Authentication → Providers → Google** → actívalo.
2. Sigue el link de la documentación de Supabase para crear las credenciales
   en Google Cloud (es un formulario, no requiere programar).
3. Si prefieres partir solo con email/contraseña, puedes omitir este paso:
   el login con email ya funciona sin configuración adicional.

## 4. Conectar el proyecto a tus variables

1. Copia el archivo `.env.local.example` y renómbralo a `.env.local`.
2. Reemplaza los valores con el **Project URL** y el **anon public key** que
   copiaste en el paso 1.

## 5. Convertirte en el primer Superadministrador

Por defecto, toda cuenta nueva se crea con el rol **Parcelero**. Para que tu
propia cuenta sea el Superadministrador:

1. Regístrate normalmente en la plataforma (Google o email).
2. En Supabase, ve a **Table Editor → usuarios**, busca tu fila (por tu
   email) y cambia `rol_id` al id del rol "Superadministrador" (lo ves en
   la tabla `roles`).

Este paso se hace una sola vez, a mano. Más adelante, el panel de
Administración permitirá hacerlo sin tocar Supabase directamente.

## 6. Desplegar en Netlify

1. Sube este proyecto a un repositorio de GitHub (puedo ayudarte con este
   paso cuando conectemos tu cuenta).
2. En Netlify: **Add new site → Import an existing project** → conecta el
   repositorio.
3. En **Site settings → Environment variables**, agrega las mismas tres
   variables de `.env.local`.
4. Netlify detecta automáticamente que es un proyecto Next.js — no hace
   falta configurar nada más para el primer despliegue.

## Qué incluye esta primera entrega

- Login (Google + email/contraseña), registro y recuperación de contraseña.
- Onboarding de 3 pasos, con solicitud de vinculación a una parcela
  (queda "pendiente" hasta que el Superadministrador la aprueba).
- Modelo de datos completo (`supabase/migrations/0001_init.sql`), con roles,
  permisos, parcelas, movimientos financieros, reportes, documentos, avisos,
  calendario, acceso/candado y auditoría.
- Seguridad a nivel de base de datos (Row Level Security): un parcelero solo
  puede ver sus propias parcelas y pagos, sin depender de que la interfaz
  "esconda" botones.
- Home con las tarjetas principales (estado de Costa Maullín, próximo
  evento, aviso destacado, accesos rápidos) y navegación inferior móvil.
- Pantallas de Mi Parcela, Mis Pagos, Calendario, Reportar, Comunidad y
  Perfil como esqueleto, listas para construir su contenido en la siguiente
  etapa.

## Qué falta (siguientes etapas)

Panel de administración (usuarios, roles, parcelas), módulo de Tesorería
completo (registrar pagos, semáforo, comprobantes), calendario y avisos
editables, documentos, directorio de vecinos, integración de clima y
WhatsApp, y el módulo de Reportes de la comunidad con foto/audio. Todo esto
ya está diseñado en el documento de arquitectura y el modelo de datos ya
tiene las tablas listas para soportarlo.
