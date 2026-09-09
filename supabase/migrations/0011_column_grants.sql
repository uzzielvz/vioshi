-- =============================================================================
-- VIOGI — 0011: Blindaje REAL de columnas internas de products
--
-- POR QUÉ EXISTE ESTA MIGRACIÓN
-- 0005 y la sección 8 de 0010 intentaron ocultar columnas con:
--     revoke select (columna) on table public.products from anon;
--
-- Eso es un NO-OP. Supabase concede `GRANT ALL ON TABLE public.products TO anon`,
-- y en PostgreSQL un privilegio a nivel TABLA cubre todas las columnas: el
-- revoke a nivel columna no lo retira. Verificado el 2026-09-08 contra
-- oilvubxpxxzfxlqhsumk tras aplicar 0010:
--
--     anon -> GET /products?select=owner,cost_mxn,embedding  => HTTP 200
--     anon -> GET /products?select=*                         => 30 columnas
--
-- El patrón correcto es: revocar SELECT de tabla y volver a conceder SELECT
-- solo sobre la lista blanca de columnas.
--
-- CONSECUENCIA A FUTURO: a partir de aquí, toda columna nueva de `products`
-- es INVISIBLE para anon/authenticated hasta que se le conceda explícitamente.
-- Si agregas una columna pública, agrega su GRANT en la misma migración.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Retirar el privilegio de tabla (lo que hacía inútil el revoke de columna)
-- ---------------------------------------------------------------------------
revoke select on table public.products from anon;
revoke select on table public.products from authenticated;

-- ---------------------------------------------------------------------------
-- 2. Conceder solo las columnas públicas
-- ---------------------------------------------------------------------------
-- Lista derivada de PUBLIC_PRODUCT_SELECT en lib/products.ts, más las columnas
-- que PostgREST necesita para ordenar y filtrar (created_at, category_id).
--
-- EXCLUIDAS a propósito (5): embedding, owner, cost_mxn,
--                            reserved_order_id, reserved_at
-- ---------------------------------------------------------------------------
grant select (
  id,
  slug,
  name,
  description,
  price_mxn,
  original_price_mxn,
  category_id,
  sku,
  material,
  made_in,
  is_featured,
  is_new,
  sold_out,
  created_at,
  updated_at,
  brand_id,
  garment_type,
  chest_cm,
  length_cm,
  sleeve_cm,
  waist_cm,
  rise_cm,
  inseam_cm,
  condition,
  defect_notes
) on table public.products to anon;

grant select (
  id,
  slug,
  name,
  description,
  price_mxn,
  original_price_mxn,
  category_id,
  sku,
  material,
  made_in,
  is_featured,
  is_new,
  sold_out,
  created_at,
  updated_at,
  brand_id,
  garment_type,
  chest_cm,
  length_cm,
  sleeve_cm,
  waist_cm,
  rise_cm,
  inseam_cm,
  condition,
  defect_notes
) on table public.products to authenticated;

-- ---------------------------------------------------------------------------
-- 3. La RPC del buscador visual debe conservar acceso a `embedding`
-- ---------------------------------------------------------------------------
-- match_products_by_image es `language sql stable` sin SECURITY DEFINER, o sea
-- corre con los privilegios de quien la llama. Al quitarle `embedding` a anon,
-- una llamada directa desde el navegador fallaría.
--
-- Hoy la app SIEMPRE la invoca desde el servidor con service_role
-- (app/api/visual-search/route.ts usa createAdminClient), así que no se rompe.
-- Se marca SECURITY DEFINER para que el buscador siga funcionando aunque en el
-- futuro se llame desde el cliente, sin volver a exponer la columna.
create or replace function public.match_products_by_image(
  query_embedding vector(768),
  match_count int default 3
)
returns table (
  id uuid,
  slug text,
  name text,
  description text,
  price_mxn numeric,
  category_id uuid,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.slug,
    p.name,
    p.description,
    p.price_mxn,
    p.category_id,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.products p
  where p.embedding is not null
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
