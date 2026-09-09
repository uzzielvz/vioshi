import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import {
  isCondition,
  isGarmentType,
  requiredMeasurements,
  type Condition,
  type GarmentType,
  type MeasurementKey,
} from '@/lib/garments'

/**
 * ⚠️ Estas consultas son PÚBLICAS. Nunca agregues `owner`, `cost_mxn`,
 * `reserved_order_id` ni `select('*')` aquí — son columnas internas
 * (ver supabase/migrations/0010_business_fields.sql).
 */

/**
 * FUENTE DE VERDAD DE LA TALLA: `product_attributes` con key 'Talla'.
 *
 * Se descartó `product_variants` a propósito: no tiene una sola referencia en
 * el proyecto, obligaría al admin a mantener filas de variante por pieza, y su
 * columna `stock` compite con el modelo de reserva de 0010 (pieza única). Para
 * un inventario de una unidad por prenda, un atributo es el vehículo correcto.
 *
 * La clave se fija desde ProductForm (FIXED_ATTRS) para que no dependa de cómo
 * la escriba quien captura. La lectura tolera mayúsculas/acentos y 'size'.
 */
const SIZE_ATTR_KEYS = ['talla', 'size']

// Quita diacríticos sin escribir marcas combinantes literales en el fuente.
const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g')

function normalizeAttrKey(key: string): string {
  return key.trim().toLowerCase().normalize('NFD').replace(DIACRITICS_RE, '')
}

function extractSize(attrs: { key: string; value: string }[]): string | undefined {
  const hit = attrs.find((a) => SIZE_ATTR_KEYS.includes(normalizeAttrKey(a.key)))
  const value = hit?.value?.trim()
  return value ? value : undefined
}

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
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  /** Talla marcada en la etiqueta. Derivada de product_attributes. */
  size?: string;
  /** Tipo de prenda — determina qué medidas aplican. */
  garmentType?: GarmentType;
  /** Medidas reales en cm, con la prenda en plano. Solo las que aplican. */
  measurements?: Partial<Record<MeasurementKey, number>>;
  condition?: Condition;
  /** Solo relevante cuando condition === 'con_detalles'. */
  defectNotes?: string;
  attributes?: { key: string; value: string }[];
}

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_mxn: string;
  sold_out: boolean;
  is_new: boolean;
  brand_id: string | null;
  garment_type: string | null;
  chest_cm: number | null;
  length_cm: number | null;
  sleeve_cm: number | null;
  waist_cm: number | null;
  rise_cm: number | null;
  inseam_cm: number | null;
  condition: string | null;
  defect_notes: string | null;
  product_images: { url: string; is_primary: boolean; sort_order: number }[];
  product_attributes: { key: string; value: string; sort_order: number }[];
  categories: { slug: string } | null;
  brands: { id: string; name: string; slug: string; logo_url: string | null } | null;
}

/** Columnas públicas. Excluye owner / cost_mxn / reserved_* por diseño. */
const PUBLIC_PRODUCT_SELECT = `
  id, slug, name, description, price_mxn, sold_out, is_new, brand_id,
  garment_type, chest_cm, length_cm, sleeve_cm, waist_cm, rise_cm, inseam_cm,
  condition, defect_notes,
  product_images (url, is_primary, sort_order),
  product_attributes (key, value, sort_order),
  categories (slug),
  brands (id, name, slug, logo_url)
` as const

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

  const attrs = [...(row.product_attributes ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ key, value }) => ({ key, value }))

  const size = extractSize(attrs)

  // La talla se muestra en su propio bloque de la ficha; repetirla dentro del
  // acordeón de características sería ruido.
  const visibleAttrs = attrs.filter((a) => !SIZE_ATTR_KEYS.includes(normalizeAttrKey(a.key)))

  // Solo las medidas que aplican al tipo, y solo las que están capturadas.
  const measurements: Partial<Record<MeasurementKey, number>> = {}
  for (const key of requiredMeasurements(row.garment_type)) {
    const value = row[key]
    if (typeof value === 'number') measurements[key] = value
  }

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
    brand: row.brands
      ? {
          id: row.brands.id,
          name: row.brands.name,
          slug: row.brands.slug,
          logo_url: row.brands.logo_url,
        }
      : undefined,
    size,
    garmentType: isGarmentType(row.garment_type) ? row.garment_type : undefined,
    measurements: Object.keys(measurements).length > 0 ? measurements : undefined,
    condition:   isCondition(row.condition) ? row.condition : undefined,
    defectNotes: row.defect_notes?.trim() || undefined,
    attributes:  visibleAttrs.length > 0 ? visibleAttrs : undefined,
  }
}

async function fetchProducts(category?: string, requireImages = true): Promise<ProductData[]> {
  const supabase = getSupabase()

  let query = supabase
    .from('products')
    .select(PUBLIC_PRODUCT_SELECT)
    .order('created_at', { ascending: false })

  if (category === 'new') {
    query = query.eq('is_new', true)
  }

  const { data, error } = await query

  if (error || !data) return []

  let rows = data as unknown as DbProduct[]
  if (requireImages) {
    rows = rows.filter((row) => (row.product_images ?? []).length > 0)
  }

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
    .select(PUBLIC_PRODUCT_SELECT)
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  const row = data as unknown as DbProduct
  if ((row.product_images ?? []).length === 0) return null

  return rowToProductData(row)
}

async function fetchStoreProducts(category?: string): Promise<ProductData[]> {
  return fetchProducts(category, true)
}

// Cached with Next.js — revalidate every 60 s, invalidable via revalidateTag('products')
export const getProducts = unstable_cache(
  fetchStoreProducts,
  ['products'],
  { revalidate: 60, tags: ['products'] }
)

/** Admin list: includes products still unpublished (no store images). */
export async function getAdminProducts(): Promise<ProductData[]> {
  return fetchProducts(undefined, false)
}

export const getProductBySlug = unstable_cache(
  fetchProductBySlug,
  ['product-by-slug'],
  { revalidate: 60, tags: ['products'] }
)
