-- Allow still-life detail + label generations (white / pressed / HD).
alter table public.studio_generations
  drop constraint if exists studio_generations_kind_check;

alter table public.studio_generations
  add constraint studio_generations_kind_check
  check (kind in ('catalog', 'model', 'detail', 'label'));
