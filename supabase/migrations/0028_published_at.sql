-- =============================================================================
-- VIOGI — 0028: Fecha real de publicación
--
-- El inventario nace con listed = false, así que created_at no es «publicado
-- hace». published_at se sella la primera vez que listed pasa a true y no se
-- mueve si la prenda se baja y se vuelve a subir.
--
-- Las que ya estaban en la tienda no tienen otra marca: se rellena con
-- created_at, que es lo más cerca que hay. El trigger se crea después de ese
-- relleno para no pisarlo con now().
--
-- Sin esta columna el catálogo se lee igual y la ficha omite «Publicado hace».
-- Número: el siguiente libre que marca STATUS.md.
-- =============================================================================

alter table public.products
  add column if not exists published_at timestamptz;

comment on column public.products.published_at is
  'Primera vez que listed pasó a true. No es created_at: el inventario nace sin publicar.';

update public.products
set published_at = created_at
where listed = true
  and published_at is null
  and created_at is not null;

grant select (published_at) on table public.products to anon, authenticated;

create or replace function public.products_stamp_published_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.listed = true and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists products_stamp_published_at on public.products;

create trigger products_stamp_published_at
  before insert or update of listed on public.products
  for each row
  execute function public.products_stamp_published_at();

comment on function public.products_stamp_published_at is
  'Sella published_at la primera vez que la prenda se publica. No lo reescribe.';
