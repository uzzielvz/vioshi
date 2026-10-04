-- =============================================================================
-- VIOGI — 0018: Inventario interno vs tienda
--
-- Una prenda puede existir en el panel (owner, costo) sin salir al catálogo.
-- `listed = false` es el default de las filas nuevas. Lo que ya estaba en la
-- base sigue publicado: el backfill pone listed = true.
--
-- El precio puede faltar mientras no se publique. En tienda, el precio es
-- obligatorio (check). Anon no lee filas no listadas (RLS).
-- =============================================================================

alter table public.products
  add column if not exists listed boolean;

update public.products
set listed = true
where listed is null;

alter table public.products
  alter column listed set default false;

alter table public.products
  alter column listed set not null;

comment on column public.products.listed is
  'true = visible y comprable en la tienda. false = solo inventario interno.';

-- Precio opcional en inventario. En tienda sigue siendo obligatorio y > 0.
alter table public.products
  drop constraint if exists products_price_mxn_check;

alter table public.products
  alter column price_mxn drop not null;

alter table public.products
  drop constraint if exists products_price_mxn_check;

alter table public.products
  add constraint products_price_mxn_check
  check (price_mxn is null or price_mxn > 0);

alter table public.products
  drop constraint if exists products_listed_requires_price;

alter table public.products
  add constraint products_listed_requires_price
  check (listed = false or price_mxn is not null);

create index if not exists products_listed_idx
  on public.products (listed)
  where listed = true;

-- Anon/authenticated solo ven lo publicado. service_role sigue viendo todo.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select
  using (listed = true);

-- 0011: columna nueva invisible hasta un GRANT. Hace falta para filtrar.
grant select (listed) on table public.products to anon, authenticated;

-- El buscador visual corre como security definer y no pasa por la policy.
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
    and p.listed = true
    and p.sold_out = false
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
