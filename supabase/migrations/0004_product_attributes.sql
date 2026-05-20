-- =============================================================================
-- VIOGI — Product attributes (key/value pairs per product)
-- Alineado con DDL verificado en producción (SEC-01 spike, 2026-05-19).
--
-- Usado por lib/products.ts (lectura pública) y admin/products/actions.ts
-- (CRUD vía service role). Ejemplos: Marca, Talla, Condición, Color.
-- =============================================================================

create table if not exists public.product_attributes (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  key         text not null,
  value       text not null,
  sort_order  int not null default 0
);

-- Lookup por producto (joins en getProducts / getProductBySlug)
create index if not exists product_attributes_product_id_idx
  on public.product_attributes (product_id);

-- Filtro por clave dentro de un producto (ej. key = 'Marca')
create index if not exists product_attributes_product_id_key_idx
  on public.product_attributes (product_id, key);

-- ---------------------------------------------------------------------------
-- RLS: lectura pública (mismo patrón que product_images / product_variants).
-- Escrituras admin usan service_role y bypass RLS.
-- ---------------------------------------------------------------------------
alter table public.product_attributes enable row level security;

drop policy if exists "product_attributes_public_read" on public.product_attributes;

create policy "product_attributes_public_read" on public.product_attributes
  for select using (true);
