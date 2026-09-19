-- =============================================================================
-- 0017: Envío a domicilio editable (paquete A1)
--
-- 0016 está reservado para L4 stores. No reutilizar ese número.
-- Semilla $10 — el monto real se cambia en /admin/settings.
-- =============================================================================

alter table public.settings
  add column if not exists home_shipping_mxn numeric(10,2)
  not null default 10
  check (home_shipping_mxn >= 0);

comment on column public.settings.home_shipping_mxn is
  'Costo de envío a domicilio en MXN. Editable en /admin/settings. Semilla 10.';
