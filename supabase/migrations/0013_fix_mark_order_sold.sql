-- =============================================================================
-- VIOGI — 0013: Corrige una vía de doble venta en mark_order_sold()
--
-- BUG (introducido en 0012, reproducido el 2026-09-13):
--
--   La condición era:  and (p.reserved_order_id = p_order_id or p.sold_out = false)
--
--   El `or p.sold_out = false` permitía que un pago tardío se llevara una
--   prenda que OTRA orden tenía reservada y viva:
--
--     1. Orden A reserva la prenda
--     2. La reserva de A vence sin pagar
--     3. Orden B la reserva legítimamente          → reserved_order_id = B
--     4. Llega el pago tardío de A → mark_order_sold(A)
--        `reserved_order_id = A` es false, pero `sold_out = false` es TRUE
--        → se vende a A y se borra la reserva de B
--     5. B paga y recibe una prenda que ya no existe
--
-- CORRECCIÓN: solo se vende si la reserva sigue siendo de esa orden, o si la
-- prenda está genuinamente libre (sin dueño). Una reserva ajena viva bloquea.
--
-- IDEMPOTENCIA: se agrega `sold_order_id` para saber a qué pedido se vendió.
-- Sin eso, un webhook repetido encontraría la reserva ya limpiada y reportaría
-- `conflict` sobre una venta perfectamente normal.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Procedencia de la venta
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists sold_order_id uuid;

comment on column public.products.sold_order_id is
  'Pedido que se llevó la pieza. Da idempotencia a mark_order_sold y sirve de trazabilidad en el admin.';

create index if not exists products_sold_order_id_idx
  on public.products (sold_order_id)
  where sold_order_id is not null;

-- Interno: no se expone al público (ver 0011 para el patrón de grants).
revoke select (sold_order_id) on table public.products from anon;
revoke select (sold_order_id) on table public.products from authenticated;

-- ---------------------------------------------------------------------------
-- 2. mark_order_sold corregida
-- ---------------------------------------------------------------------------
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
  'Marca vendidas las prendas del pedido. Nunca le quita una reserva viva a otro pedido: eso devuelve outcome=conflict para revisión manual.';

revoke all on function public.mark_order_sold(uuid) from public, anon, authenticated;
grant execute on function public.mark_order_sold(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 3. Alinear la ventana de tarjeta con el mínimo de Stripe
-- ---------------------------------------------------------------------------
-- Stripe Checkout Sessions no permite `expires_at` a menos de 30 minutos.
-- Con la reserva en 20 min quedaba una ventana de 10 minutos en la que el
-- cliente podía seguir pagando una prenda ya liberada — pagos que caían en
-- revisión manual sin necesidad.
--
-- Se sube el default a 30 para que reserva y sesión venzan juntas. Sigue
-- siendo configurable desde /admin/settings: bajarlo reintroduce el desfase
-- a propósito, y el caso borde lo absorbe mark_order_sold.
alter table public.settings
  alter column card_reserve_minutes set default 30;

update public.settings
   set card_reserve_minutes = 30
 where id and card_reserve_minutes < 30;

alter table public.settings drop constraint if exists settings_card_reserve_minutes_check;
alter table public.settings
  add constraint settings_card_reserve_minutes_check
  check (card_reserve_minutes between 30 and 240);

comment on column public.settings.card_reserve_minutes is
  'Ventana de reserva con tarjeta. Mínimo 30: es el piso que impone Stripe Checkout para expires_at.';
