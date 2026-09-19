-- =============================================================================
-- VIOGI — 0016: Stores (primer código de marketplace)
--
-- Qué hace:
--   1. Tabla `stores`. Una sola fila sembrada: Viogi.
--   2. `products.store_id` → FK a stores, backfill a Viogi, NOT NULL.
--   3. Tabla `store_applications`: /vender deja de fingir el submit.
--
-- Qué NO hace: Connect, comisión, registro abierto de vendedores.
-- `stripe_account_id` nace aquí solo para que L7 no tenga que migrar la tabla;
-- NO se concede a anon/authenticated.
--
-- Mario NO es una store: sigue siendo `products.owner` (interno, 0010).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. stores
-- ---------------------------------------------------------------------------
-- El id de Viogi es fijo y literal a propósito: `products.store_id` lo usa como
-- DEFAULT de columna, y un DEFAULT no puede resolverse con un subquery.
create table if not exists public.stores (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  bio               text,
  logo_url          text,
  instagram         text,
  status            text not null default 'draft'
                      check (status in ('draft', 'active', 'paused')),
  stripe_account_id text,
  created_at        timestamptz not null default now()
);

comment on table public.stores is
  'Tiendas de la plataforma. Fase 1: solo Viogi. El alta es un acto de admin.';
comment on column public.stores.status is
  'draft = no visible · active = visible en /tienda/[slug] · paused = oculta temporalmente.';
comment on column public.stores.stripe_account_id is
  'Cuenta Connect (L7). INTERNO: nunca se concede a anon/authenticated.';

create index if not exists stores_status_idx on public.stores (status);

-- ---------------------------------------------------------------------------
-- 2. Blindaje de columnas de stores (mismo patrón que 0011)
-- ---------------------------------------------------------------------------
-- Supabase concede privilegios de tabla a anon/authenticated por default
-- privileges. Un privilegio a nivel TABLA cubre todas las columnas, así que
-- un `revoke select (stripe_account_id)` sería un no-op. Se retira el
-- privilegio de tabla y se reconcede solo la lista blanca.
revoke all on table public.stores from anon, authenticated;

grant select (
  id,
  slug,
  name,
  bio,
  logo_url,
  instagram,
  status,
  created_at
) on table public.stores to anon, authenticated;

-- RLS: el público solo ve tiendas activas. Las escrituras las hace el admin
-- con service_role (bypass RLS), igual que en brands (0007).
alter table public.stores enable row level security;

drop policy if exists "stores_public_read" on public.stores;

create policy "stores_public_read" on public.stores
  for select using (status = 'active');

-- ---------------------------------------------------------------------------
-- 3. Semilla: Viogi es la primera tienda
-- ---------------------------------------------------------------------------
-- bio / logo_url son editables desde la DB. No se re-escriben en código.
insert into public.stores (id, slug, name, bio, instagram, status)
values (
  '00000000-0000-4000-8000-000000000001',
  'viogi',
  'Viogi',
  'Streetwear de segunda mano. Cada prenda es pieza única.',
  'https://www.instagram.com/viogi_/',
  'active'
)
on conflict (id) do update set
  slug      = excluded.slug,
  name      = excluded.name,
  instagram = excluded.instagram,
  status    = excluded.status;

-- ---------------------------------------------------------------------------
-- 4. products.store_id
-- ---------------------------------------------------------------------------
-- DEFAULT a Viogi: en Fase 1 toda prenda capturada es de Viogi, así que el
-- admin de productos NO necesita un selector de tienda todavía.
alter table public.products
  add column if not exists store_id uuid references public.stores(id)
    default '00000000-0000-4000-8000-000000000001';

update public.products
set store_id = '00000000-0000-4000-8000-000000000001'
where store_id is null;

alter table public.products
  alter column store_id set not null;

create index if not exists products_store_id_idx on public.products (store_id);

-- 0011: toda columna nueva de `products` es invisible para anon/authenticated
-- hasta que se le concede explícitamente. `store_id` es público.
grant select (store_id) on table public.products to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. store_applications — /vender persiste de verdad
-- ---------------------------------------------------------------------------
-- Campos = los del form actual de /vender. Aprobar sigue siendo un acto de
-- admin: esta tabla NO crea filas en `stores`.
create table if not exists public.store_applications (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text not null,
  phone        text not null,
  brand_name   text not null,
  website      text,
  instagram    text,
  product_type text not null,
  experience   text not null,
  message      text not null,
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now()
);

comment on table public.store_applications is
  'Solicitudes de /vender. Insert vía Server Action con service_role. Anon no lee.';

create index if not exists store_applications_status_idx
  on public.store_applications (status, created_at desc);

-- RLS activo y CERO policies: solo service_role (que hace bypass) entra.
-- El form es público, pero el insert pasa por una Server Action, no por
-- PostgREST desde el navegador.
alter table public.store_applications enable row level security;

revoke all on table public.store_applications from anon, authenticated;
