-- =============================================================================
-- VIOGI — Brands (pilot)
-- Nueva entidad de primer nivel para marcas con logos minimalistas.
-- Reemplaza el uso de `product_attributes` (key='marca') como fuente de verdad.
-- =============================================================================

-- 1. Tabla brands
create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  logo_url    text,                    -- URL pública del logo (bucket brand-logos). Puede ser null.
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger updated_at
create trigger if not exists brands_updated_at
  before update on public.brands
  for each row execute function handle_updated_at();

-- 2. Agregar brand_id a products (nullable para backfill gradual)
alter table public.products
  add column if not exists brand_id uuid references public.brands(id);

create index if not exists products_brand_id_idx on public.products(brand_id);

-- 3. RLS para brands
-- Lectura pública SOLO de marcas activas (consistente con pickup_points)
alter table public.brands enable row level security;

drop policy if exists "brands_public_read" on public.brands;

create policy "brands_public_read" on public.brands
  for select using (is_active = true);

-- Nota: Escrituras las hace el admin usando service_role (bypass RLS).
-- No se crean policies de escritura para authenticated/anon.

-- 4. (Opcional pero recomendado) Índice para búsquedas por nombre
create index if not exists brands_name_idx on public.brands (name);
create index if not exists brands_slug_idx on public.brands (slug);

-- =============================================================================
-- Notas de implementación (BR-01..06)
-- =============================================================================
-- - Bucket Storage: crear manualmente "brand-logos" en Supabase Dashboard.
-- - Los logos deben subirse preferentemente en B/N y estilo minimalista.
-- - Durante la transición, productos pueden tener brand_id = null.
-- - BR-06: Backfill manual desde /admin/products una vez que existan las marcas.
-- - El atributo legacy "marca" en product_attributes se mantiene temporalmente
--   para no romper nada hasta completar el backfill.
