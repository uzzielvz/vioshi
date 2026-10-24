-- =============================================================================
-- VIOGI — 0025: Seguir tiendas y marcas
--
-- Primera parte de lo social (PROYECTO § 6, Etapa 3). Cada fila apunta a
-- exactamente una tienda o una marca; borrar la tienda o la marca borra sus
-- follows. Las listas son privadas: cada quien lee solo las suyas y el conteo
-- público sale de follower_count().
--
-- Guardados no necesita tabla nueva: usa `wishlist_items` (0001), que ya tiene
-- RLS por usuario.
--
-- Número propuesto por el agente: el humano lo confirma al aplicarla.
-- =============================================================================

create table if not exists public.follows (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  store_id    uuid references public.stores(id) on delete cascade,
  brand_id    uuid references public.brands(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint follows_one_target check (num_nonnulls(store_id, brand_id) = 1)
);

create unique index if not exists follows_user_store_uniq
  on public.follows(user_id, store_id) where store_id is not null;
create unique index if not exists follows_user_brand_uniq
  on public.follows(user_id, brand_id) where brand_id is not null;
create index if not exists follows_store_idx on public.follows(store_id) where store_id is not null;
create index if not exists follows_brand_idx on public.follows(brand_id) where brand_id is not null;
create index if not exists follows_user_idx on public.follows(user_id, created_at desc);

alter table public.follows enable row level security;

drop policy if exists "follows_select_own" on public.follows;
create policy "follows_select_own" on public.follows
  for select using (auth.uid() = user_id);

drop policy if exists "follows_insert_own" on public.follows;
create policy "follows_insert_own" on public.follows
  for insert with check (auth.uid() = user_id);

drop policy if exists "follows_delete_own" on public.follows;
create policy "follows_delete_own" on public.follows
  for delete using (auth.uid() = user_id);

-- Conteo público sin exponer quién sigue a quién.
create or replace function public.follower_count(p_kind text, p_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.follows
  where (p_kind = 'store' and store_id = p_id)
     or (p_kind = 'brand' and brand_id = p_id);
$$;

revoke all on function public.follower_count(text, uuid) from public;
grant execute on function public.follower_count(text, uuid) to anon, authenticated;

comment on table public.follows is
  'Una persona sigue una tienda o una marca. Privada por RLS; el conteo sale de follower_count().';
