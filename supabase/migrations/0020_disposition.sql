-- =============================================================================
-- VIOGI — 0020: Qué pasó con la prenda (merma incluida)
--
-- Al cargar el inventario base entra mucha merma. Si la merma se cuenta como
-- inventario normal, dos números quedan mintiendo:
--   · "invertido sin vender" suma dinero que no se va a recuperar
--   · "falta por vender" cuenta prendas que nadie va a comprar
--
-- `disposition` separa el inventario vendible de lo que ya no lo es. Es
-- INTERNA, como `owner` y `cost_mxn` (0010/0011): no se concede al público.
--
-- No se usa `condition` para esto: una prenda `con_detalles` SÍ se vende, más
-- barata. La merma es otra cosa — no entra a la tienda.
-- =============================================================================

alter table public.products
  add column if not exists disposition text;

update public.products
   set disposition = 'activa'
 where disposition is null;

alter table public.products
  alter column disposition set default 'activa';

alter table public.products
  alter column disposition set not null;

alter table public.products
  drop constraint if exists products_disposition_check;

alter table public.products
  add constraint products_disposition_check
  check (disposition in ('activa', 'merma', 'uso_personal', 'donada'));

comment on column public.products.disposition is
  'INTERNO — activa = inventario vendible · merma = no vendible, pérdida · uso_personal · donada. Solo las activas pueden estar listed.';

-- ---------------------------------------------------------------------------
-- Lo que no es inventario activo no puede estar en la tienda
-- ---------------------------------------------------------------------------
-- Red de seguridad en la base, no solo en el formulario: aunque un bug mande
-- listed = true en una merma, el insert falla. La RLS pública (0018) filtra por
-- listed, así que esto mantiene la merma fuera del catálogo por dos caminos.
alter table public.products
  drop constraint if exists products_listed_requires_active;

alter table public.products
  add constraint products_listed_requires_active
  check (disposition = 'activa' or listed = false);

-- 0011: columna nueva nace invisible hasta un GRANT. Esta no se concede.
revoke select (disposition) on table public.products from anon;
revoke select (disposition) on table public.products from authenticated;

create index if not exists products_owner_disposition_idx
  on public.products (owner, disposition);
