-- =============================================================================
-- VIOGI — 0023: Merma vuelve a "no se vende"
--
-- 0021 abrió la merma a la tienda. No: la merma sí cuenta en las finanzas como
-- baja, y no se publica. El arranque no la usa; el destino por defecto sigue
-- siendo `activa`.
-- =============================================================================

alter table public.products
  drop constraint if exists products_listed_requires_active;

alter table public.products
  add constraint products_listed_requires_active
  check (disposition = 'activa' or listed = false);

comment on column public.products.disposition is
  'INTERNO — activa = inventario vendible · merma = no vendible, pérdida · uso_personal · donada. Solo las activas pueden estar listed.';
