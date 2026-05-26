import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

async function fetchActiveBrands(): Promise<Brand[]> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error || !data) return []

  return data as Brand[]
}

export const getActiveBrands = unstable_cache(
  fetchActiveBrands,
  ['active-brands'],
  { revalidate: 60, tags: ['brands'] }
)
