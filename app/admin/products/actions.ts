'use server'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateProductEmbedding } from '@/lib/embeddings'
import {
  generateSku,
  isCondition,
  isGarmentType,
  isOwner,
  MEASUREMENT_KEYS,
  MEASUREMENT_LABELS,
  MEASUREMENT_MAX_CM,
  MEASUREMENT_MIN_CM,
  requiredMeasurements,
  type MeasurementKey,
} from '@/lib/garments'

type ActionState = { error: string } | null

// ─── Campos de negocio (0010) ────────────────────────────────────────────────

type BusinessFields = {
  owner: string
  cost_mxn: number | null
  garment_type: string
  condition: string
  defect_notes: string | null
} & Partial<Record<MeasurementKey, number | null>>

/**
 * Valida y normaliza los campos introducidos en la migración 0010.
 * Espejo en servidor de las reglas del formulario: una prenda de segunda mano
 * sin medidas ni estado no se publica.
 */
function parseBusinessFields(formData: FormData): { error: string } | { data: BusinessFields } {
  const owner = (formData.get('owner') as string | null)?.trim() ?? ''
  if (!isOwner(owner)) return { error: 'Selecciona un propietario válido (uzziel o mario).' }

  const costRaw = (formData.get('cost_mxn') as string | null)?.trim() ?? ''
  let cost_mxn: number | null = null
  if (costRaw) {
    const parsed = parseFloat(costRaw)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return { error: 'El costo de adquisición debe ser un número mayor o igual a 0.' }
    }
    cost_mxn = parsed
  }

  const garment_type = (formData.get('garment_type') as string | null)?.trim() ?? ''
  if (!isGarmentType(garment_type)) return { error: 'Selecciona un tipo de prenda.' }

  const condition = (formData.get('condition') as string | null)?.trim() ?? ''
  if (!isCondition(condition)) return { error: 'Selecciona el estado de la prenda.' }

  const defectRaw = (formData.get('defect_notes') as string | null)?.trim() ?? ''
  if (condition === 'con_detalles' && !defectRaw) {
    return { error: 'Describe los detalles de la prenda: es obligatorio cuando el estado es «Con detalles».' }
  }
  // Si el estado deja de ser 'con_detalles', la nota vieja no debe sobrevivir.
  const defect_notes = condition === 'con_detalles' ? defectRaw : null

  // Solo las medidas del tipo se guardan; el resto se limpia explícitamente
  // para que cambiar de pants a playera no deje cintura/tiro colgando.
  const required = requiredMeasurements(garment_type)
  const measurements: Partial<Record<MeasurementKey, number | null>> = {}

  for (const key of MEASUREMENT_KEYS) {
    if (!required.includes(key)) {
      measurements[key] = null
      continue
    }
    const raw = (formData.get(key) as string | null)?.trim() ?? ''
    if (!raw) {
      return { error: `Falta la medida «${MEASUREMENT_LABELS[key]}». Sin medidas la prenda no se publica.` }
    }
    const parsed = Number(raw)
    if (!Number.isInteger(parsed) || parsed < MEASUREMENT_MIN_CM || parsed > MEASUREMENT_MAX_CM) {
      return {
        error: `«${MEASUREMENT_LABELS[key]}» debe ser un número entero entre ${MEASUREMENT_MIN_CM} y ${MEASUREMENT_MAX_CM} cm.`,
      }
    }
    measurements[key] = parsed
  }

  return { data: { owner, cost_mxn, garment_type, condition, defect_notes, ...measurements } }
}

/** SKU único con reintento: el índice `products.sku unique` es la garantía real. */
async function generateUniqueSku(
  supabase: SupabaseClient,
  garmentType: string
): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateSku(garmentType)
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('sku', candidate)
      .maybeSingle()
    if (!data) return candidate
  }
  return null
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type UploadResult = { uploaded: number; errors: string[] }

export async function deleteProduct(id: string) {
  await requireAdminSession()
  const supabase = createAdminClient()
  await supabase.from('products').delete().eq('id', id)
  revalidateTag('products')
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const name            = formData.get('name') as string
  const slug            = formData.get('slug') as string
  const description     = (formData.get('description') as string) || null
  const price_mxn       = parseFloat(formData.get('price_mxn') as string)
  const origPrice       = formData.get('original_price_mxn') as string
  const original_price_mxn = origPrice ? parseFloat(origPrice) : null
  const category_id     = (formData.get('category_id') as string) || null
  const brand_id        = (formData.get('brand_id') as string) || null
  const material        = (formData.get('material') as string) || null
  const made_in         = (formData.get('made_in') as string) || 'México'
  const is_featured     = formData.get('is_featured') === 'on'
  const is_new          = formData.get('is_new') === 'on'
  const sold_out        = formData.get('sold_out') === 'on'

  const business = parseBusinessFields(formData)
  if ('error' in business) return { error: business.error }

  // SKU automático: ya no se pide a mano.
  const sku = await generateUniqueSku(supabase, business.data.garment_type)
  if (!sku) return { error: 'No se pudo generar un SKU único. Intenta de nuevo.' }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name, slug, description, price_mxn, original_price_mxn, category_id, brand_id,
      sku, material, made_in, is_featured, is_new, sold_out,
      ...business.data,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  const uploadResult = await uploadImages(supabase, product.id, formData, 0, false)
  const uploadError = formatUploadErrors(uploadResult)
  if (uploadError) return { error: uploadError }

  await saveAttributes(supabase, product.id, formData)
  await indexProductEmbedding(supabase, product.id)

  revalidateTag('products')
  redirect('/admin/products')
}

export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()
  const id = formData.get('id') as string

  const name            = formData.get('name') as string
  const slug            = formData.get('slug') as string
  const description     = (formData.get('description') as string) || null
  const price_mxn       = parseFloat(formData.get('price_mxn') as string)
  const origPrice       = formData.get('original_price_mxn') as string
  const original_price_mxn = origPrice ? parseFloat(origPrice) : null
  const category_id     = (formData.get('category_id') as string) || null
  const brand_id        = (formData.get('brand_id') as string) || null
  const material        = (formData.get('material') as string) || null
  const made_in         = (formData.get('made_in') as string) || 'México'
  const is_featured     = formData.get('is_featured') === 'on'
  const is_new          = formData.get('is_new') === 'on'
  const sold_out        = formData.get('sold_out') === 'on'

  const business = parseBusinessFields(formData)
  if ('error' in business) return { error: business.error }

  // El SKU viaja readOnly desde el form. Si la prenda aún no tiene (borrador
  // creado en el Studio), se genera ahora.
  let sku = (formData.get('sku') as string | null)?.trim() || null
  if (!sku) {
    sku = await generateUniqueSku(supabase, business.data.garment_type)
    if (!sku) return { error: 'No se pudo generar un SKU único. Intenta de nuevo.' }
  }

  const { error } = await supabase
    .from('products')
    .update({
      name, slug, description, price_mxn, original_price_mxn, category_id, brand_id,
      sku, material, made_in, is_featured, is_new, sold_out,
      ...business.data,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  // Delete images not in keptImageIds
  const keptIds = formData.getAll('keptImageIds') as string[]
  const { data: existingImages } = await supabase
    .from('product_images')
    .select('id, url')
    .eq('product_id', id)

  const storagePrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`

  for (const img of existingImages ?? []) {
    if (!keptIds.includes(img.id)) {
      const storagePath = img.url.startsWith(storagePrefix)
        ? decodeURIComponent(img.url.slice(storagePrefix.length).split('?')[0])
        : null
      if (storagePath) await supabase.storage.from('product-images').remove([storagePath])
      await supabase.from('product_images').delete().eq('id', img.id)
    }
  }

  // Get next sort_order for new images
  const { data: remaining } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const baseOrder = (remaining?.[0]?.sort_order ?? -1) + 1
  const hasPrimary = keptIds.length > 0

  const uploadResult = await uploadImages(supabase, id, formData, baseOrder, hasPrimary)
  const uploadError = formatUploadErrors(uploadResult)
  if (uploadError) return { error: uploadError }

  await saveAttributes(supabase, id, formData)
  await indexProductEmbedding(supabase, id)

  revalidateTag('products')
  redirect('/admin/products')
}

type SupabaseClient = ReturnType<typeof createAdminClient>

/**
 * Re-embeds the product from its primary image (image -> AI description ->
 * vector) so visual search stays in sync with the catalog. Best-effort:
 * failures (no GEMINI_API_KEY, fetch/API errors) never block publishing.
 */
async function indexProductEmbedding(supabase: SupabaseClient, productId: string) {
  const { data: primary } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId)
    .eq('is_primary', true)
    .maybeSingle()

  if (!primary?.url) return

  const vector = await generateProductEmbedding(primary.url)
  if (vector) {
    await supabase.from('products').update({ embedding: vector }).eq('id', productId)
  }
}

function formatUploadErrors(result: UploadResult): string | null {
  if (result.errors.length === 0) return null
  if (result.uploaded === 0) {
    return `No se pudieron subir las imágenes: ${result.errors.join('; ')}`
  }
  return `Algunas imágenes no se subieron: ${result.errors.join('; ')}`
}

async function uploadImages(
  supabase: SupabaseClient,
  productId: string,
  formData: FormData,
  baseOrder: number,
  hasPrimary: boolean
): Promise<UploadResult> {
  const files = formData.getAll('images') as File[]
  const validFiles = files.filter(f => f instanceof File && f.size > 0)
  const errors: string[] = []
  let uploaded = 0

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push(`${file.name}: tipo no permitido (usa JPEG, PNG o WebP)`)
      continue
    }
    if (file.size > MAX_IMAGE_BYTES) {
      errors.push(`${file.name}: supera 5 MB`)
      continue
    }

    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${productId}/${Date.now()}-${i}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`)
      continue
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    const { error: insertError } = await supabase.from('product_images').insert({
      product_id: productId,
      url:        publicUrl,
      is_primary: !hasPrimary && uploaded === 0,
      sort_order: baseOrder + uploaded,
    })

    if (insertError) {
      errors.push(`${file.name}: ${insertError.message}`)
      continue
    }

    uploaded++
  }

  return { uploaded, errors }
}

async function saveAttributes(
  supabase: SupabaseClient,
  productId: string,
  formData: FormData
) {
  const keys   = formData.getAll('attr_key') as string[]
  const values = formData.getAll('attr_value') as string[]

  // Delete existing and re-insert (simple replace strategy)
  await supabase.from('product_attributes').delete().eq('product_id', productId)

  const rows = keys
    .map((key, i) => ({ key: key.trim(), value: (values[i] ?? '').trim() }))
    .filter(r => r.key && r.value)
    .map((r, i) => ({ product_id: productId, key: r.key, value: r.value, sort_order: i }))

  if (rows.length > 0) {
    await supabase.from('product_attributes').insert(rows)
  }
}
