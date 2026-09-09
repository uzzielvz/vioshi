-- =============================================================================
-- VIOGI — 0010: Campos de negocio e inventario único
--
-- Base para dos trabajos posteriores:
--   1. Control de stock (reserved_order_id / reserved_at)
--   2. Ficha de producto de segunda mano (medidas, estado, talla)
--
-- ⚠️ PRIVACIDAD: `cost_mxn` y `owner` son campos INTERNOS.
--    Nunca deben salir hacia el cliente. Las consultas públicas viven en
--    lib/products.ts y usan lista explícita de columnas (no `select('*')`).
--    Si algún día se agrega un `select('*')` sobre products, esta garantía
--    se rompe. Ver el bloque de REVOKE al final del archivo.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROPIEDAD Y RENTABILIDAD (interno)
-- ---------------------------------------------------------------------------
-- owner: quién puso el capital de la pieza. Se usa para repartir utilidad.
-- Deliberadamente SIN default: asignar propietario en silencio produce
-- repartos equivocados. Todo INSERT debe declararlo explícitamente.
alter table public.products
  add column if not exists owner text;

alter table public.products
  add column if not exists cost_mxn numeric(10,2) check (cost_mxn >= 0);

-- Backfill de filas existentes (datos de prueba) antes de imponer NOT NULL.
update public.products set owner = 'uzziel' where owner is null;

alter table public.products
  alter column owner set not null;

alter table public.products
  drop constraint if exists products_owner_check;

alter table public.products
  add constraint products_owner_check check (owner in ('uzziel', 'mario'));

comment on column public.products.owner    is 'INTERNO — nunca exponer al cliente. Propietario del capital de la pieza.';
comment on column public.products.cost_mxn is 'INTERNO — nunca exponer al cliente. Costo de adquisición en MXN.';

-- ---------------------------------------------------------------------------
-- 2. RESERVA (la consume el control de stock, trabajo posterior)
-- ---------------------------------------------------------------------------
-- Sin FK a orders(id) a propósito: la reserva debe sobrevivir al borrado de
-- una orden fallida sin bloquear el DELETE ni dejar la pieza congelada.
-- La liberación la hace el webhook / el cron de expiración.
alter table public.products
  add column if not exists reserved_order_id uuid;

alter table public.products
  add column if not exists reserved_at timestamptz;

-- Índice parcial para el cron que libera reservas vencidas.
create index if not exists products_reserved_at_idx
  on public.products (reserved_at)
  where reserved_at is not null;

comment on column public.products.reserved_at is 'Inicio de la reserva. El cron libera las que superan la ventana de pago.';

-- ---------------------------------------------------------------------------
-- 3. TIPO DE PRENDA
-- ---------------------------------------------------------------------------
-- Nullable: el Studio crea borradores (sold_out = true) antes de conocer el
-- tipo. Se vuelve obligatorio al publicar, validado en la Server Action.
alter table public.products
  add column if not exists garment_type text;

alter table public.products
  drop constraint if exists products_garment_type_check;

alter table public.products
  add constraint products_garment_type_check check (
    garment_type in (
      'playera', 'hoodie', 'sudadera', 'chamarra',
      'pants', 'jeans', 'shorts', 'otro'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. MEDIDAS REALES (cm)
-- ---------------------------------------------------------------------------
-- Columnas discretas, no JSON, para poder filtrar por rango:
--   where chest_cm between 55 and 60
-- smallint alcanza de sobra (ninguna medida de prenda pasa de 32767 cm)
-- y el rango 20–200 descarta capturas en pulgadas o dedazos.
alter table public.products add column if not exists chest_cm  smallint check (chest_cm  between 20 and 200);
alter table public.products add column if not exists length_cm smallint check (length_cm between 20 and 200);
alter table public.products add column if not exists sleeve_cm smallint check (sleeve_cm between 20 and 200);
alter table public.products add column if not exists waist_cm  smallint check (waist_cm  between 20 and 200);
alter table public.products add column if not exists rise_cm   smallint check (rise_cm   between 20 and 200);
alter table public.products add column if not exists inseam_cm smallint check (inseam_cm between 20 and 200);

comment on column public.products.chest_cm is 'Axila a axila con la prenda en plano — NO es contorno.';

-- Integridad: si la prenda ya tiene tipo, debe tener sus medidas.
-- Exime a los borradores del Studio (garment_type is null).
-- Respaldo del validador de la Server Action, no su sustituto.
alter table public.products
  drop constraint if exists products_measurements_by_type_check;

alter table public.products
  add constraint products_measurements_by_type_check check (
    garment_type is null
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

-- ---------------------------------------------------------------------------
-- 5. ESTADO Y HONESTIDAD
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists condition text;

alter table public.products
  add column if not exists defect_notes text;

alter table public.products
  drop constraint if exists products_condition_check;

alter table public.products
  add constraint products_condition_check check (
    condition in ('impecable', 'buen_estado', 'con_detalles')
  );

-- 'con_detalles' sin explicar el detalle es exactamente lo que erosiona la
-- confianza en segunda mano. Si se declara, se describe.
-- (condition null => la expresión da NULL => CHECK pasa: borradores exentos.)
alter table public.products
  drop constraint if exists products_defect_notes_required_check;

alter table public.products
  add constraint products_defect_notes_required_check check (
    condition is distinct from 'con_detalles'
    or (defect_notes is not null and length(btrim(defect_notes)) > 0)
  );

-- ---------------------------------------------------------------------------
-- 6. ÍNDICES
-- ---------------------------------------------------------------------------
create index if not exists products_owner_idx        on public.products (owner);
create index if not exists products_garment_type_idx on public.products (garment_type);
create index if not exists products_condition_idx    on public.products (condition);

-- ---------------------------------------------------------------------------
-- 7. BLINDAJE DE COLUMNAS INTERNAS
-- ---------------------------------------------------------------------------
-- Mismo patrón que 0005 con `embedding`: aunque lib/products.ts ya selecciona
-- columnas explícitas, esto bloquea el scraping vía REST (?select=*) con las
-- llaves anon / authenticated. service_role conserva acceso para el admin.
revoke select (owner)             on table public.products from anon;
revoke select (owner)             on table public.products from authenticated;
revoke select (cost_mxn)          on table public.products from anon;
revoke select (cost_mxn)          on table public.products from authenticated;
revoke select (reserved_order_id) on table public.products from anon;
revoke select (reserved_order_id) on table public.products from authenticated;

-- ---------------------------------------------------------------------------
-- 8. REPARACIÓN DE 0005 (SEC-06)
-- ---------------------------------------------------------------------------
-- 0005_hide_product_embedding_from_public.sql NUNCA se aplicó en esta base.
-- Verificado el 2026-08-31 contra el proyecto oilvubxpxxzfxlqhsumk:
--
--   anon -> GET /rest/v1/products?select=id,embedding  => 200, valores no nulos
--   anon -> GET /rest/v1/products?select=*             => 17 columnas, embedding incluido
--
-- La anon key viaja en el bundle del navegador, así que los embeddings del
-- buscador visual eran descargables por cualquiera. Se repara aquí, en la
-- misma transacción, en vez de reaplicar 0005 (que el historial marcará como
-- aplicada y por tanto nunca volvería a ejecutarse).
revoke select (embedding) on table public.products from anon;
revoke select (embedding) on table public.products from authenticated;
