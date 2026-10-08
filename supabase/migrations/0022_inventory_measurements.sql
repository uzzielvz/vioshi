-- =============================================================================
-- VIOGI — 0022: Medidas solo al publicar
--
-- El alta de inventario (listed = false) guarda tipo, dueño y costo sin
-- cinta métrica. 0010 exigía las medidas en cuanto había garment_type, y
-- el insert del panel reventaba en products_measurements_by_type_check.
-- Publicar sigue exigiendo las mismas medidas por tipo.
-- =============================================================================

alter table public.products
  drop constraint if exists products_measurements_by_type_check;

alter table public.products
  add constraint products_measurements_by_type_check check (
    listed = false
    or garment_type is null
    or (garment_type in ('playera', 'hoodie', 'sudadera')
        and chest_cm is not null and length_cm is not null)
    or (garment_type = 'chamarra'
        and chest_cm is not null and length_cm is not null and sleeve_cm is not null)
    or (garment_type in ('pants', 'jeans')
        and waist_cm is not null and rise_cm is not null and inseam_cm is not null)
    or (garment_type = 'shorts'
        and waist_cm is not null and rise_cm is not null and length_cm is not null)
    or garment_type = 'otro'
  );
