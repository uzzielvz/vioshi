-- =============================================================================
-- VIOGI — 0012: Control de stock para inventario de pieza única
--
-- OBJETIVO: que sea imposible vender dos veces la misma prenda, incluso con
-- dos personas comprando al mismo tiempo.
--
-- La garantía vive AQUÍ, en la base, no en TypeScript: un solo UPDATE
-- condicional por el que pasa todo. No hay SELECT-luego-UPDATE en ninguna
-- parte, porque entre los dos cabe otra transacción y ahí está el bug.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. SETTINGS — parámetros de negocio editables sin desplegar código
-- ---------------------------------------------------------------------------
-- Fila única forzada por `id boolean primary key default true check (id)`:
-- solo existe el valor `true`, así que un segundo INSERT choca con la PK.
create table if not exists public.settings (
  id                       boolean primary key default true check (id),
  card_only_threshold_mxn  numeric(10,2) not null default 500  check (card_only_threshold_mxn >= 0),
  card_reserve_minutes     int           not null default 20   check (card_reserve_minutes between 5 and 240),
  voucher_hours            int           not null default 24   check (voucher_hours between 1 and 168),
  manual_hold_days         int           not null default 3    check (manual_hold_days between 1 and 30),
  updated_at               timestamptz   not null default now()
);

insert into public.settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at
  before update on public.settings
  for each row execute function handle_updated_at();

-- Lectura pública: son parámetros de negocio, no secretos, y el checkout
-- necesita el umbral para decidir qué métodos de pago ofrecer.
alter table public.settings enable row level security;
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings for select using (true);

-- Escrituras: solo service_role (admin). Sin policies de insert/update/delete.
revoke insert, update, delete on table public.settings from anon;
revoke insert, update, delete on table public.settings from authenticated;

comment on table public.settings is 'Fila única. Parámetros de negocio editables desde /admin/settings.';

-- ---------------------------------------------------------------------------
-- 2. PRODUCTS — columnas que faltaban para modelar los 5 estados
-- ---------------------------------------------------------------------------
-- reserved_until: se guarda el vencimiento YA CALCULADO. Es más simple que
-- recalcularlo según el método en cada consulta, y hace que la condición de
-- expiración quepa en el propio UPDATE de reserva.
alter table public.products
  add column if not exists reserved_until timestamptz;

-- reservation_kind: sin esto no se distingue APARTADA de PAGO_PENDIENTE
-- de APARTADA_MANUAL, porque las tres tienen reserved_order_id no nulo.
alter table public.products
  add column if not exists reservation_kind text;

alter table public.products drop constraint if exists products_reservation_kind_check;
alter table public.products
  add constraint products_reservation_kind_check
  check (reservation_kind in ('card', 'voucher', 'manual'));

-- Contacto para apartados manuales (venta por DM con anticipo).
alter table public.products add column if not exists reserved_contact_name  text;
alter table public.products add column if not exists reserved_contact_phone text;

-- Coherencia: si hay reserva, hay vencimiento y tipo.
alter table public.products drop constraint if exists products_reservation_coherent_check;
alter table public.products
  add constraint products_reservation_coherent_check check (
    (reserved_order_id is null and reservation_kind is null and reserved_until is null)
    or (reserved_until is not null and reservation_kind is not null)
  );

-- Índice para el panel de "reservas por vencer" y para el cron de higiene.
drop index if exists public.products_reserved_at_idx;
create index if not exists products_reserved_until_idx
  on public.products (reserved_until)
  where reserved_until is not null;

-- Índice para el listado público (excluye vendidas).
create index if not exists products_available_idx
  on public.products (created_at desc)
  where sold_out = false;

-- Columnas internas: nunca al cliente (ver 0011 para el patrón correcto).
-- reservation_kind queda interno porque delata si fue apartado por DM.
revoke select (reservation_kind, reserved_contact_name, reserved_contact_phone)
  on table public.products from anon;
revoke select (reservation_kind, reserved_contact_name, reserved_contact_phone)
  on table public.products from authenticated;

-- `reserved_until` SÍ es público, a propósito: la tienda debe mostrar
-- "apartada" distinto de "vendida", y saber cuándo vuelve a liberarse.
-- No revela de quién es la reserva (eso es reserved_order_id, que sigue
-- interno desde 0010).
--
-- No se usa una columna generada porque `GENERATED ALWAYS AS ... STORED`
-- exige una expresión inmutable y `now()` no lo es. El estado se deriva en
-- lib/products.ts comparando reserved_until contra el momento de la consulta.
grant select (reserved_until) on table public.products to anon;
grant select (reserved_until) on table public.products to authenticated;

-- ---------------------------------------------------------------------------
-- 3. ORDERS — datos del cliente que el checkout capturaba y tiraba a la basura
-- ---------------------------------------------------------------------------
-- Antes de esta migración el INSERT de orders guardaba email y montos, y nada
-- más: ni nombre, ni teléfono, ni dirección. shipping_address_id quedaba null
-- siempre. Un pedido a domicilio no se podía enviar.
alter table public.orders add column if not exists first_name text;
alter table public.orders add column if not exists last_name  text;
alter table public.orders add column if not exists phone      text;

-- Caso borde del webhook: pago confirmado pero la prenda ya se fue con otro.
alter table public.orders add column if not exists needs_review  boolean not null default false;
alter table public.orders add column if not exists review_reason text;

create index if not exists orders_needs_review_idx
  on public.orders (created_at desc)
  where needs_review = true;

-- El checkout ahora usa Stripe Checkout Sessions; se guarda el id de sesión
-- además del PaymentIntent, porque los eventos checkout.session.* lo traen.
alter table public.orders add column if not exists stripe_session_id text;
create index if not exists orders_stripe_session_id_idx
  on public.orders (stripe_session_id)
  where stripe_session_id is not null;

-- OXXO y SPEI necesitan estados que el enum original no contemplaba.
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_status_check check (
    payment_status in ('pending', 'awaiting_payment', 'completed', 'failed', 'refunded', 'expired')
  );

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders
  add constraint orders_payment_method_check check (
    payment_method is null
    or payment_method in ('card', 'oxxo', 'spei', 'paypal', 'apple_pay', 'google_pay', 'manual')
  );

-- ---------------------------------------------------------------------------
-- 4. RESERVA ATÓMICA — el corazón del control de stock
-- ---------------------------------------------------------------------------
-- Un solo UPDATE condicional. Si devuelve menos filas de las pedidas, alguien
-- ganó la carrera y se lanza excepción, lo que revierte TODO el trabajo de la
-- función: o se reservan todas las prendas del carrito, o ninguna.
--
-- La condición `reserved_until < now()` va DENTRO del UPDATE, así que una
-- reserva vencida no bloquea a nadie aunque ningún cron la haya limpiado.
-- El sistema es correcto sin el cron.
create or replace function public.reserve_products(
  p_product_ids uuid[],
  p_order_id    uuid,
  p_kind        text
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_until    timestamptz;
  v_expected int := coalesce(array_length(p_product_ids, 1), 0);
  v_reserved int;
  v_blocked  text;
begin
  if v_expected = 0 then
    raise exception 'empty_cart' using errcode = 'P0001';
  end if;

  if p_kind not in ('card', 'voucher', 'manual') then
    raise exception 'invalid_kind:%', p_kind using errcode = 'P0001';
  end if;

  -- Ventana según el método, leída de settings (nada hardcodeado).
  select case p_kind
           when 'card'    then now() + make_interval(mins  => s.card_reserve_minutes)
           when 'voucher' then now() + make_interval(hours => s.voucher_hours)
           when 'manual'  then now() + make_interval(days  => s.manual_hold_days)
         end
    into v_until
    from public.settings s
   where s.id;

  if v_until is null then
    raise exception 'settings_missing' using errcode = 'P0001';
  end if;

  -- EL UPDATE. Nada de SELECT previo.
  update public.products p
     set reserved_order_id = p_order_id,
         reserved_at       = now(),
         reserved_until    = v_until,
         reservation_kind  = p_kind
   where p.id = any(p_product_ids)
     and p.sold_out = false
     and (
       p.reserved_order_id is null                -- libre
       or p.reserved_order_id = p_order_id        -- ya es de este pedido (reintento)
       or p.reserved_until < now()                -- reserva ajena vencida
     );

  get diagnostics v_reserved = row_count;

  if v_reserved <> v_expected then
    -- Nombrar exactamente cuál se fue, para poder decírselo al usuario.
    select string_agg(name, ', ' order by name)
      into v_blocked
      from public.products
     where id = any(p_product_ids)
       and (
         sold_out = true
         or (reserved_order_id is not null
             and reserved_order_id <> p_order_id
             and reserved_until >= now())
       );

    -- Revierte el UPDATE parcial: todas o ninguna.
    raise exception 'product_unavailable:%', coalesce(v_blocked, 'desconocida')
      using errcode = 'P0001';
  end if;

  return v_until;
end;
$$;

comment on function public.reserve_products is
  'Reserva atómica de pieza única. Lanza product_unavailable:<nombres> si alguna se fue.';

-- ---------------------------------------------------------------------------
-- 5. LIBERACIÓN
-- ---------------------------------------------------------------------------
create or replace function public.release_reservation(p_order_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare v_released int;
begin
  update public.products
     set reserved_order_id      = null,
         reserved_at            = null,
         reserved_until         = null,
         reservation_kind       = null,
         reserved_contact_name  = null,
         reserved_contact_phone = null
   where reserved_order_id = p_order_id
     and sold_out = false;          -- nunca "liberar" algo ya vendido
  get diagnostics v_released = row_count;
  return v_released;
end;
$$;

-- Extiende la reserva de un pedido cuando el método pasa a voucher
-- (OXXO/SPEI): la ventana de 20 min de tarjeta no alcanza para ir a pagar.
create or replace function public.extend_reservation_for_voucher(p_order_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare v_until timestamptz;
begin
  select now() + make_interval(hours => s.voucher_hours) into v_until
    from public.settings s where s.id;

  update public.products
     set reserved_until   = v_until,
         reservation_kind = 'voucher'
   where reserved_order_id = p_order_id
     and sold_out = false;

  return v_until;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. MARCAR VENDIDA — con detección del caso borde
-- ---------------------------------------------------------------------------
-- Caso borde del punto 5: el pago se confirma pero la reserva ya venció y otra
-- persona se llevó la prenda. No se puede dejar pasar en silencio: se devuelve
-- outcome='conflict' para que el webhook marque el pedido a revisión manual.
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
           reserved_order_id      = null,
           reserved_at            = null,
           reserved_until         = null,
           reservation_kind       = null,
           reserved_contact_name  = null,
           reserved_contact_phone = null
      from items i
     where p.id = i.pid
       and (p.reserved_order_id = p_order_id or p.sold_out = false)
    returning p.id, p.name
  )
  select i.pid,
         coalesce(v.name, pr.name, '(eliminada)'),
         case when v.id is not null then 'sold' else 'conflict' end
    from items i
    left join vendidas v  on v.id = i.pid
    left join public.products pr on pr.id = i.pid;
end;
$$;

comment on function public.mark_order_sold is
  'Marca vendidas las prendas del pedido. outcome=conflict si otra orden ya se la llevó.';

-- ---------------------------------------------------------------------------
-- 7. HIGIENE — no es correctitud, la condición ya vive en reserve_products
-- ---------------------------------------------------------------------------
create or replace function public.expire_reservations()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare v_expired int;
begin
  update public.products
     set reserved_order_id      = null,
         reserved_at            = null,
         reserved_until         = null,
         reservation_kind       = null,
         reserved_contact_name  = null,
         reserved_contact_phone = null
   where reserved_order_id is not null
     and reserved_until < now();
  get diagnostics v_expired = row_count;
  return v_expired;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. ADMIN — apartado manual y liberación a mano
-- ---------------------------------------------------------------------------
create or replace function public.admin_manual_hold(
  p_product_id uuid,
  p_name       text,
  p_phone      text,
  p_until      timestamptz default null
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare v_until timestamptz;
begin
  select coalesce(p_until, now() + make_interval(days => s.manual_hold_days))
    into v_until from public.settings s where s.id;

  update public.products
     set reserved_order_id      = gen_random_uuid(),   -- sin pedido real detrás
         reserved_at            = now(),
         reserved_until         = v_until,
         reservation_kind       = 'manual',
         reserved_contact_name  = p_name,
         reserved_contact_phone = p_phone
   where id = p_product_id
     and sold_out = false
     and (reserved_order_id is null or reserved_until < now());

  if not found then
    raise exception 'product_unavailable' using errcode = 'P0001';
  end if;

  return v_until;
end;
$$;

create or replace function public.admin_release_product(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
     set reserved_order_id      = null,
         reserved_at            = null,
         reserved_until         = null,
         reservation_kind       = null,
         reserved_contact_name  = null,
         reserved_contact_phone = null
   where id = p_product_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. PRIVILEGIOS DE LAS FUNCIONES
-- ---------------------------------------------------------------------------
-- Son SECURITY DEFINER: solo el servidor (service_role) debe poder invocarlas.
-- Sin esto, cualquiera con la anon key podría reservar o liberar inventario.
revoke all on function public.reserve_products(uuid[], uuid, text)        from public, anon, authenticated;
revoke all on function public.release_reservation(uuid)                   from public, anon, authenticated;
revoke all on function public.extend_reservation_for_voucher(uuid)        from public, anon, authenticated;
revoke all on function public.mark_order_sold(uuid)                       from public, anon, authenticated;
revoke all on function public.expire_reservations()                       from public, anon, authenticated;
revoke all on function public.admin_manual_hold(uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.admin_release_product(uuid)                 from public, anon, authenticated;

grant execute on function public.reserve_products(uuid[], uuid, text)        to service_role;
grant execute on function public.release_reservation(uuid)                   to service_role;
grant execute on function public.extend_reservation_for_voucher(uuid)        to service_role;
grant execute on function public.mark_order_sold(uuid)                       to service_role;
grant execute on function public.expire_reservations()                       to service_role;
grant execute on function public.admin_manual_hold(uuid, text, text, timestamptz) to service_role;
grant execute on function public.admin_release_product(uuid)                 to service_role;
