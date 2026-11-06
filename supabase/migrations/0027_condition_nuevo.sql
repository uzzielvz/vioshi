-- =============================================================================
-- VIOGI — 0027: Estado «nuevo»
--
-- La escala de estado de la ficha queda en cuatro, de mejor a peor:
--   nuevo         con etiqueta y sin usar
--   impecable     usada, pero al 100: sin marcas ni desgaste
--   buen_estado   uso normal, desgaste leve; sin manchas ni roturas
--   con_detalles  tiene algo que ver; exige defect_notes (0010)
--
-- Solo amplía el CHECK de 0010; las filas existentes no cambian.
--
-- Número propuesto por el agente: el humano lo confirma al aplicarla.
-- =============================================================================

alter table public.products
  drop constraint if exists products_condition_check;

alter table public.products
  add constraint products_condition_check check (
    condition in ('nuevo', 'impecable', 'buen_estado', 'con_detalles')
  );
