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
}

/** Columnas públicas. Excluye stripe_account_id por diseño. */
const PUBLIC_STORE_SELECT = 'id, slug, name, bio, logo_url, instagram' as const

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

  return data as Store[]
}

async function fetchStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('stores')
    .select(PUBLIC_STORE_SELECT)
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data) return null

  return data as Store
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
