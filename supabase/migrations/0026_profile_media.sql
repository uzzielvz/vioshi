-- =============================================================================
-- VIOGI — 0026: Foto y portada de perfil
--
-- Todas las cuentas son el mismo perfil (FROZEN): una persona y una tienda
-- tienen foto y portada. Sin portada subida, el perfil arma un collage con sus
-- piezas, así que nada se rompe mientras esta migración no esté aplicada.
--
-- Las subidas las hace el servidor con service_role, siempre en la carpeta
-- `<user_id>/` del bucket. Por eso el bucket no tiene policies de escritura:
-- anon y authenticated no pueden subir ni borrar directo. La lectura es
-- pública (bucket public = true) porque las fotos se ven en el perfil.
--
-- Número propuesto por el agente: el humano lo confirma al aplicarla.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Columnas
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists cover_url  text;

comment on column public.profiles.avatar_url is
  'Foto de perfil (bucket profile-media). Null = inicial sobre carton.';
comment on column public.profiles.cover_url is
  'Portada (bucket profile-media). Null = collage de sus piezas guardadas.';

alter table public.stores
  add column if not exists cover_url text;

comment on column public.stores.cover_url is
  'Portada de la tienda. Null = collage de sus piezas en venta. La pone el admin.';

-- stores usa privilegios por columna (0016): la columna nueva se concede aparte.
grant select (cover_url) on table public.stores to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
