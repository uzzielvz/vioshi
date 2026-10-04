-- =============================================================================
-- VIOGI — 0019: Cuándo se vendió y cuándo se compró
--
-- Sin fecha de venta no existe "la ganancia de septiembre". La base solo sabía
-- `sold_out` (sí/no), `sold_order_id` (únicamente si la venta fue por la web) y
-- `updated_at`, que se mueve al editar la prenda y por eso miente.
--
-- `sold_at`     = cuándo se vendió. null = sigue disponible.
-- `acquired_on` = cuándo se compró la prenda, si no fue el día que se registró.
--
-- Las dos son INTERNAS, como `cost_mxn` y `owner` (0010/0011): no se conceden a
-- anon ni a authenticated.
-- =============================================================================

alter table public.products
  add column if not exists sold_at timestamptz;

alter table public.products
  add column if not exists acquired_on date;

comment on column public.products.sold_at is
  'INTERNO — cuándo se vendió. null = disponible. Lo escribe mark_order_sold (web) o el toggle del admin (presencial).';
comment on column public.products.acquired_on is
  'INTERNO — fecha de compra de la pieza. Si es null se usa created_at (cuándo se registró).';

-- ---------------------------------------------------------------------------
-- 1. Backfill honesto
-- ---------------------------------------------------------------------------
-- Solo se puede reconstruir lo que pasó por un pedido web: ahí hay fecha.
-- Las vendidas por Instagram/DM se quedan en null A PROPÓSITO. El tablero las
-- cuenta como "vendidas sin fecha"; inventarles un mes falsearía la ganancia.
update public.products p
   set sold_at = o.created_at
  from public.orders o
 where p.sold_order_id = o.id
   and p.sold_out = true
   and p.sold_at is null;

-- ---------------------------------------------------------------------------
-- 2. Blindaje (patrón 0011: columna nueva nace invisible)
-- ---------------------------------------------------------------------------
revoke select (sold_at)     on table public.products from anon;
revoke select (sold_at)     on table public.products from authenticated;
revoke select (acquired_on) on table public.products from anon;
revoke select (acquired_on) on table public.products from authenticated;

create index if not exists products_owner_sold_at_idx
  on public.products (owner, sold_at);

create index if not exists products_owner_acquired_idx
  on public.products (owner, acquired_on);

-- ---------------------------------------------------------------------------
-- 3. mark_order_sold: la venta web también deja fecha
-- ---------------------------------------------------------------------------
-- Copia literal de 0013 con una sola línea nueva (`sold_at = now()`). El resto
-- —incluida la regla que nunca le quita una reserva viva a otro pedido y el
-- outcome 'conflict'— se conserva sin tocar.
create or replace function public.mark_order_sold(p_order_id uuid)
returns table (product_id uuid, product_name text, outcome text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with items as (
    select distinct oi.product_id as pid
      from public.order_items oi
     where oi.order_id = p_order_id
       and oi.product_id is not null
  ),
  vendidas as (
    update public.products p
       set sold_out               = true,
           sold_order_id          = p_order_id,
           sold_at                = now(),
           reserved_order_id      = null,
           reserved_at            = null,
           reserved_until         = null,
           reservation_kind       = null,
           reserved_contact_name  = null,
           reserved_contact_phone = null
      from items i
     where p.id = i.pid
       and p.sold_out = false
       and (
         -- la reserva sigue siendo de este pedido (caso normal, incluso vencida:
         -- si nadie más la tomó, la prenda sigue siendo suya)
         p.reserved_order_id = p_order_id
         -- o está genuinamente libre: nadie tiene un reclamo sobre ella
         or p.reserved_order_id is null
       )
    returning p.id, p.name
  )
  select i.pid,
         coalesce(v.name, pr.name, '(eliminada)'),
         case
           when v.id is not null then 'sold'
           -- webhook repetido sobre una venta que ya se hizo a ESTE pedido
           when pr.sold_order_id = p_order_id then 'sold'
           else 'conflict'
         end
    from items i
    left join vendidas v          on v.id  = i.pid
    left join public.products pr  on pr.id = i.pid;
end;
$$;

comment on function public.mark_order_sold is
  'Marca vendidas las prendas del pedido y les pone sold_at. Nunca le quita una reserva viva a otro pedido: eso devuelve outcome=conflict para revisión manual.';

revoke all on function public.mark_order_sold(uuid) from public, anon, authenticated;
grant execute on function public.mark_order_sold(uuid) to service_role;
