-- =============================================================================
-- VIOGI — Studio (admin Gemini Image)
-- Fotos crudas y drafts privados. Solo las generaciones aprobadas copian a
-- product-images / product_images (tienda).
-- Escrituras: service_role (createAdminClient). Sin SELECT anónimo.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Storage: bucket privado (no público). Sin policies de lectura para anon.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-private',
  'studio-private',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Style refs globales (look de modelo VIOGI). 4–8 fotos.
-- ---------------------------------------------------------------------------
create table if not exists public.studio_style_refs (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists studio_style_refs_sort_idx
  on public.studio_style_refs (sort_order);

-- ---------------------------------------------------------------------------
-- Fotos reales de la prenda (no salen en la tienda)
-- ---------------------------------------------------------------------------
create table if not exists public.studio_raw_photos (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  shot_type     text not null check (shot_type in ('front', 'back', 'detail', 'label')),
  storage_path  text not null,
  created_at    timestamptz not null default now(),
  unique (product_id, shot_type)
);

create index if not exists studio_raw_photos_product_id_idx
  on public.studio_raw_photos (product_id);

-- ---------------------------------------------------------------------------
-- Generaciones Gemini (drafts). product_image_id se setea al aprobar.
-- ---------------------------------------------------------------------------
create table if not exists public.studio_generations (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null references public.products(id) on delete cascade,
  kind               text not null check (kind in ('catalog', 'model')),
  status             text not null default 'pending'
                     check (status in ('pending', 'approved', 'discarded')),
  model              text not null,
  clean_wear         boolean not null default false,
  garment_description text,
  prompt_snapshot    text,
  storage_path       text not null,
  product_image_id   uuid references public.product_images(id) on delete set null,
  created_at         timestamptz not null default now()
);

create index if not exists studio_generations_product_id_idx
  on public.studio_generations (product_id, created_at desc);

create index if not exists studio_generations_status_idx
  on public.studio_generations (product_id, status);

-- ---------------------------------------------------------------------------
-- RLS: sin policies de SELECT para anon/authenticated.
-- El admin usa service_role (bypass). La tienda nunca lee estas tablas.
-- ---------------------------------------------------------------------------
alter table public.studio_style_refs  enable row level security;
alter table public.studio_raw_photos  enable row level security;
alter table public.studio_generations enable row level security;
