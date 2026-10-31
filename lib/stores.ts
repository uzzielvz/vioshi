import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

/**
 * ⚠️ Estas consultas son PÚBLICAS. Nunca agregues `stripe_account_id` ni
 * `select('*')` aquí — la cuenta Connect es interna
 * (ver supabase/migrations/0016_stores.sql).
 */

export interface Store {
  id: string
  slug: string
  name: string
  bio: string | null
  logo_url: string | null
  instagram: string | null
  /** Portada subida (0026). Sin ella el perfil arma un collage con sus piezas. */
  cover_url: string | null
  created_at: string | null
}

/** Columnas públicas. Excluye stripe_account_id por diseño. */
const PUBLIC_STORE_SELECT = 'id, slug, name, bio, logo_url, instagram, created_at' as const
/** Con la portada de 0026. Si la columna aún no existe se lee sin ella. */
const PUBLIC_STORE_SELECT_WITH_COVER = `${PUBLIC_STORE_SELECT}, cover_url` as const

function withCover(row: Omit<Store, 'cover_url'> & { cover_url?: string | null }): Store {
  return { ...row, cover_url: row.cover_url ?? null }
}

// Public client — catalog-level data, anon key is enough.
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchActiveStores(): Promise<Store[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('stores')
    .select(PUBLIC_STORE_SELECT)
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error || !data) return []

  return (data as Omit<Store, 'cover_url'>[]).map(withCover)
}

async function fetchStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = getSupabase()

  const query = (columns: string) =>
    supabase.from('stores').select(columns).eq('slug', slug).eq('status', 'active').maybeSingle()

  let { data, error } = await query(PUBLIC_STORE_SELECT_WITH_COVER)
  if (error) ({ data, error } = await query(PUBLIC_STORE_SELECT))

  if (error || !data) return null

  return withCover(data as unknown as Store)
}

export const getActiveStores = unstable_cache(
  fetchActiveStores,
  ['active-stores'],
  { revalidate: 60, tags: ['stores'] }
)

export const getStoreBySlug = unstable_cache(
  fetchStoreBySlug,
  ['store-by-slug'],
  { revalidate: 60, tags: ['stores'] }
)
