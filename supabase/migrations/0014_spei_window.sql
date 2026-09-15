-- =============================================================================
-- VIOGI — 0014: Ventana de reserva por método de pago + dinero atrapado (SPEI)
--
-- CONTEXTO (verificado en la documentación de Stripe, 2026-09-13):
--
-- 1. SPEI confirma en ~30 min EN DÍAS HÁBILES. En fin de semana o festivo,
--    Citibanamex confirma hasta el siguiente día hábil. Una ventana fija de
--    30 min haría que cada sábado y domingo el cliente transfiriera bien,
--    perdiera la prenda, y su dinero quedara atrapado.
--
-- 2. El dinero de una transferencia que no se puede reconciliar NO REBOTA al
--    banco del cliente: se queda como saldo del cliente en Stripe.
--      · a los 75 días Stripe intenta devolverlo solo
--      · a los 90 días, si no identificó la cuenta, lo BARRE al balance del
--        comercio — o sea, terminas con dinero de alguien a quien no le
--        entregaste nada
--    El evento que lo señala es `customer_cash_balance_transaction.created`.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tercera ventana: SPEI
-- ---------------------------------------------------------------------------
alter table public.settings
  add column if not exists spei_reserve_minutes int not null default 30;

alter table public.settings drop constraint if exists settings_spei_reserve_minutes_check;
alter table public.settings
  add constraint settings_spei_reserve_minutes_check
  check (spei_reserve_minutes between 15 and 1440);

comment on column public.settings.spei_reserve_minutes is
  'Ventana de reserva para SPEI EN DÍA HÁBIL. Fuera de día hábil se extiende automáticamente al cierre del siguiente día hábil (Citibanamex confirma hasta entonces).';

-- ---------------------------------------------------------------------------
-- 2. Calendario de días hábiles
-- ---------------------------------------------------------------------------
-- Editable desde el admin: el calendario bancario cambia cada año y no se
-- puede derivar solo de la ley (los bancos cierran además en Jueves y Viernes
-- Santo, 2 de noviembre y 12 de diciembre).
create table if not exists public.business_holidays (
  holiday_date date primary key,
  label        text not null,
  created_at   timestamptz not null default now()
);

alter table public.business_holidays enable row level security;
drop policy if exists "business_holidays_public_read" on public.business_holidays;
create policy "business_holidays_public_read" on public.business_holidays for select using (true);
revoke insert, update, delete on table public.business_holidays from anon, authenticated;

insert into public.business_holidays (holiday_date, label) values
  ('2026-01-01', 'Año Nuevo'),
  ('2026-02-02', 'Día de la Constitución'),
  ('2026-03-16', 'Natalicio de Benito Juárez'),
  ('2026-04-02', 'Jueves Santo'),
  ('2026-04-03', 'Viernes Santo'),
  ('2026-05-01', 'Día del Trabajo'),
  ('2026-09-16', 'Independencia'),
  ('2026-11-02', 'Día de Muertos'),
  ('2026-11-16', 'Revolución Mexicana'),
  ('2026-12-12', 'Virgen de Guadalupe'),
  ('2026-12-25', 'Navidad'),
  ('2027-01-01', 'Año Nuevo'),
  ('2027-02-01', 'Día de la Constitución'),
  ('2027-03-15', 'Natalicio de Benito Juárez'),
  ('2027-03-25', 'Jueves Santo'),
  ('2027-03-26', 'Viernes Santo'),
  ('2027-05-01', 'Día del Trabajo'),
  ('2027-09-16', 'Independencia'),
  ('2027-11-02', 'Día de Muertos'),
  ('2027-11-15', 'Revolución Mexicana'),
  ('2027-12-12', 'Virgen de Guadalupe'),
  ('2027-12-25', 'Navidad')
on conflict (holiday_date) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Funciones de días hábiles (zona horaria de México)
-- ---------------------------------------------------------------------------
create or replace function public.is_business_day(p_date date)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select extract(isodow from p_date) < 6
     and not exists (select 1 from public.business_holidays h where h.holiday_date = p_date);
$$;

create or replace function public.next_business_day(p_date date)
returns date
language plpgsql
stable
security definer
set search_path = public
as $$
declare d date := p_date + 1;
begin
  -- Tope de 30 iteraciones: sin él, un calendario mal cargado colgaría la función.
  for _ in 1..30 loop
    if public.is_business_day(d) then return d; end if;
    d := d + 1;
  end loop;
  return p_date + 1;
end;
$$;

/**
 * Vencimiento de una reserva SPEI.
 *
 * Día hábil  → ahora + spei_reserve_minutes
 * No hábil   → cierre del siguiente día hábil (23:59 hora de México), para que
 *              la reserva siga viva cuando Citibanamex confirme ese día.
 *
 * También cubre el borde de un viernes por la noche: si la ventana corta cae
 * ya en sábado, se extiende igual al siguiente día hábil.
 */
create or replace function public.spei_reserve_until()
returns timestamptz
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_mins    int;
  v_hoy     date;
  v_naive   timestamptz;
  v_naive_d date;
begin
  select s.spei_reserve_minutes into v_mins from public.settings s where s.id;

  v_hoy     := (now() at time zone 'America/Mexico_City')::date;
  v_naive   := now() + make_interval(mins => v_mins);
  v_naive_d := (v_naive at time zone 'America/Mexico_City')::date;

  if public.is_business_day(v_hoy) and public.is_business_day(v_naive_d) then
    return v_naive;
  end if;

  -- Cierre del siguiente día hábil, en hora de México.
  return ((public.next_business_day(v_hoy) + 1)::timestamp - interval '1 minute')
         at time zone 'America/Mexico_City';
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. reserve_products ahora acepta 'spei'
-- ---------------------------------------------------------------------------
alter table public.products drop constraint if exists products_reservation_kind_check;
alter table public.products
  add constraint products_reservation_kind_check
  check (reservation_kind in ('card', 'spei', 'voucher', 'manual'));

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

  if p_kind not in ('card', 'spei', 'voucher', 'manual') then
    raise exception 'invalid_kind:%', p_kind using errcode = 'P0001';
  end if;

  -- Ventana según el método, leída de settings (nada hardcodeado).
  if p_kind = 'spei' then
    v_until := public.spei_reserve_until();
  else
    select case p_kind
             when 'card'    then now() + make_interval(mins  => s.card_reserve_minutes)
             when 'voucher' then now() + make_interval(hours => s.voucher_hours)
             when 'manual'  then now() + make_interval(days  => s.manual_hold_days)
           end
      into v_until
      from public.settings s
     where s.id;
  end if;

  if v_until is null then
    raise exception 'settings_missing' using errcode = 'P0001';
  end if;

  update public.products p
     set reserved_order_id = p_order_id,
         reserved_at       = now(),
         reserved_until    = v_until,
         reservation_kind  = p_kind
   where p.id = any(p_product_ids)
     and p.sold_out = false
     and (
       p.reserved_order_id is null
       or p.reserved_order_id = p_order_id
       or p.reserved_until < now()
     );

  get diagnostics v_reserved = row_count;

  if v_reserved <> v_expected then
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

    raise exception 'product_unavailable:%', coalesce(v_blocked, 'desconocida')
      using errcode = 'P0001';
  end if;

  return v_until;
end;
$$;

-- Extiende la reserva al confirmarse el método elegido en Stripe.
create or replace function public.extend_reservation_for_method(
  p_order_id uuid,
  p_kind     text
)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare v_until timestamptz;
begin
  if p_kind = 'spei' then
    v_until := public.spei_reserve_until();
  elsif p_kind = 'voucher' then
    select now() + make_interval(hours => s.voucher_hours) into v_until
      from public.settings s where s.id;
  else
    select now() + make_interval(mins => s.card_reserve_minutes) into v_until
      from public.settings s where s.id;
  end if;

  update public.products
     set reserved_until   = v_until,
         reservation_kind = p_kind
   where reserved_order_id = p_order_id
     and sold_out = false;

  return v_until;
end;
$$;

drop function if exists public.extend_reservation_for_voucher(uuid);

-- ---------------------------------------------------------------------------
-- 5. DINERO ATRAPADO — transferencias sin pedido vivo
-- ---------------------------------------------------------------------------
-- Alimentada por el webhook `customer_cash_balance_transaction.created`.
-- Si entra dinero que no corresponde a ningún pedido, aquí queda registrado
-- con el reloj corriendo: a los 75 días Stripe intenta devolverlo, a los 90
-- lo barre al balance del comercio.
create table if not exists public.orphan_funds (
  id                     uuid primary key default gen_random_uuid(),
  stripe_transaction_id  text unique not null,      -- idempotencia del webhook
  stripe_customer_id     text,
  order_id               uuid references public.orders(id) on delete set null,
  amount_mxn             numeric(10,2) not null,
  currency               text not null default 'mxn',
  received_at            timestamptz not null default now(),
  status                 text not null default 'pendiente'
                         check (status in ('pendiente', 'reembolsado', 'aplicado', 'ignorado')),
  notes                  text,
  resolved_at            timestamptz,
  created_at             timestamptz not null default now()
);

create index if not exists orphan_funds_status_idx
  on public.orphan_funds (status, received_at)
  where status = 'pendiente';

alter table public.orphan_funds enable row level security;
-- Sin policies: solo service_role (admin). La tienda nunca lee esta tabla.

comment on table public.orphan_funds is
  'Transferencias recibidas sin pedido vivo. Reloj de Stripe: 75 días intento de devolución automática, 90 días barrido al balance del comercio.';

-- Días transcurridos y urgencia, para el panel del admin.
create or replace view public.orphan_funds_pending as
  select f.*,
         extract(day from (now() - f.received_at))::int as dias_transcurridos,
         greatest(0, 75 - extract(day from (now() - f.received_at))::int) as dias_para_devolucion_auto,
         greatest(0, 90 - extract(day from (now() - f.received_at))::int) as dias_para_barrido
    from public.orphan_funds f
   where f.status = 'pendiente'
   order by f.received_at asc;

revoke all on public.orphan_funds_pending from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. PRIVILEGIOS
-- ---------------------------------------------------------------------------
revoke all on function public.is_business_day(date)                from public, anon, authenticated;
revoke all on function public.next_business_day(date)              from public, anon, authenticated;
revoke all on function public.spei_reserve_until()                 from public, anon, authenticated;
revoke all on function public.reserve_products(uuid[], uuid, text) from public, anon, authenticated;
revoke all on function public.extend_reservation_for_method(uuid, text) from public, anon, authenticated;

grant execute on function public.is_business_day(date)                to service_role;
grant execute on function public.next_business_day(date)              to service_role;
grant execute on function public.spei_reserve_until()                 to service_role;
grant execute on function public.reserve_products(uuid[], uuid, text) to service_role;
grant execute on function public.extend_reservation_for_method(uuid, text) to service_role;
