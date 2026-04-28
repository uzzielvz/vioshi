import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

// ProductData: simplified interface for current data layer.
// For the richer DB type see @/types/product.ts
export interface ProductData {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  slug: string;
  description?: string;
  category?: string;
  soldOut?: boolean;
  isNew?: boolean;
  size?: string;
  variants?: {
    size?: string[];
    color?: string[];
  };
}

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_mxn: string;
  sold_out: boolean;
  is_new: boolean;
  product_images: { url: string; is_primary: boolean; sort_order: number }[];
  categories: { slug: string } | null;
}

// Public client — no cookies needed for catalog reads (anon key, public data)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function rowToProductData(row: DbProduct): ProductData {
  const sortedImages = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)

  const primaryImage = sortedImages.find((img) => img.is_primary)
  const image = primaryImage?.url ?? sortedImages[0]?.url ?? ''
  const images = sortedImages.map((img) => img.url)

  return {
    id:          row.id,
    name:        row.name,
    price:       parseFloat(row.price_mxn),
    image,
    images:      images.length > 1 ? images : undefined,
    slug:        row.slug,
    description: row.description ?? undefined,
    category:    row.categories?.slug ?? undefined,
    soldOut:     row.sold_out,
    isNew:       row.is_new,
  }
}

async function fetchProducts(category?: string): Promise<ProductData[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('products')
    .select(`
      id, slug, name, description, price_mxn, sold_out, is_new,
      product_images (url, is_primary, sort_order),
      categories (slug)
    `)
    .order('created_at', { ascending: false })

  if (category === 'new') {
    query = query.eq('is_new', true)
  }

  const { data, error } = await query

  if (error || !data) return []

  const rows = data as unknown as DbProduct[]

  // Supabase returns all rows with categories null for non-matching joins
  // — filter client-side when a specific category is requested
  if (category && category !== 'all' && category !== 'new') {
    return rows
      .filter((row) => row.categories?.slug === category)
      .map(rowToProductData)
  }

  return rows.map(rowToProductData)
}

async function fetchProductBySlug(slug: string): Promise<ProductData | null> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, slug, name, description, price_mxn, sold_out, is_new,
      product_images (url, is_primary, sort_order),
      categories (slug)
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  return rowToProductData(data as unknown as DbProduct)
}

// Cached with Next.js — revalidate every 60 s, invalidable via revalidateTag('products')
export const getProducts = unstable_cache(
  fetchProducts,
  ['products'],
  { revalidate: 60, tags: ['products'] }
)

export const getProductBySlug = unstable_cache(
  fetchProductBySlug,
  ['product-by-slug'],
  { revalidate: 60, tags: ['products'] }
)
