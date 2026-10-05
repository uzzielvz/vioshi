-- =============================================================================
-- VIOGI — 0021: Merma es stock de arranque, no una baja
--
-- 0020 dejó `merma` como "no se vende". El arranque es al revés: esa ropa es
-- de drops ya cobrados. Sigue en inventario, se puede publicar, y el tablero
-- la deja fuera de la ganancia y del capital. Uso personal y donada siguen
-- sin poder estar `listed`.
-- =============================================================================

alter table public.products
  drop constraint if exists products_listed_requires_active;

alter table public.products
  add constraint products_listed_requires_active
  check (disposition in ('activa', 'merma') or listed = false);

comment on column public.products.disposition is
  'INTERNO — activa = capital actual · merma = drop ya recuperado, se puede vender y no entra en la ganancia · uso_personal · donada. Esas dos últimas no pueden estar listed.';
