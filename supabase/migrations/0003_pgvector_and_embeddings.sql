-- =============================================================================
-- VIOGI — Visual Search (pgvector + embeddings)
-- Habilita pgvector, agrega columna embedding a products y crea RPC
-- para búsqueda por similitud (cosine).
--
-- Dimensión: 768 (Matryoshka truncation desde gemini-embedding-001
-- que es 3072 por defecto; pasamos outputDimensionality: 768 al SDK).
-- =============================================================================

create extension if not exists vector;

alter table public.products
  add column if not exists embedding vector(768);

create index if not exists products_embedding_idx
  on public.products
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_products_by_image(
  query_embedding vector(768),
  match_count int default 3
)
returns table (
  id uuid,
  slug text,
  name text,
  description text,
  price_mxn numeric,
  category_id uuid,
  similarity float
)
language sql stable
as $$
  select
    p.id,
    p.slug,
    p.name,
    p.description,
    p.price_mxn,
    p.category_id,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.products p
  where p.embedding is not null
  order by p.embedding <=> query_embedding
  limit match_count;
$$;
