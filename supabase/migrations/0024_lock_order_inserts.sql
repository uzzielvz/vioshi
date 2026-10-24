-- =============================================================================
-- VIOGI — 0024: Cerrar inserts abiertos en pedidos y el cambio de role
--
-- `orders_insert_any` y `order_items_insert_any` (0001) tenían
-- `with check (true)`: con la anon key cualquiera podía insertar order_items en
-- un pedido cuyo id conoce (el suyo lo devuelve createCheckoutSessionAction), y
-- mark_order_sold confía en esos items. La app crea pedidos solo con
-- service_role (checkout/actions.ts), que no pasa por RLS, así que quitarlas
-- no rompe el checkout.
--
-- `profile_update_own` deja que cada quien edite su fila, incluida la columna
-- `role`. El trigger conserva el role cuando escribe una sesión de la app
-- (roles `anon` / `authenticated` de PostgREST). service_role y el SQL editor
-- (postgres) sí pueden cambiarlo.
--
-- Número propuesto por el agente: el humano lo confirma al aplicarla.
-- =============================================================================

drop policy if exists "orders_insert_any" on public.orders;
drop policy if exists "order_items_insert_any" on public.order_items;

create or replace function public.keep_profile_role()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role and current_user in ('anon', 'authenticated') then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_keep_role on public.profiles;
create trigger profiles_keep_role
  before update on public.profiles
  for each row execute function public.keep_profile_role();

comment on function public.keep_profile_role is
  'Una sesión de la app (anon/authenticated) no puede cambiar profiles.role; service_role y postgres sí.';
