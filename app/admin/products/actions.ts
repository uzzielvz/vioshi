'use server'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionState = { error: string } | null

export async function deleteProduct(id: string) {
  const supabase = createAdminClient()
  await supabase.from('products').delete().eq('id', id)
  revalidateTag('products')
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient()

  const name            = formData.get('name') as string
  const slug            = formData.get('slug') as string
  const description     = (formData.get('description') as string) || null
  const price_mxn       = parseFloat(formData.get('price_mxn') as string)
  const origPrice       = formData.get('original_price_mxn') as string
  const original_price_mxn = origPrice ? parseFloat(origPrice) : null
  const category_id     = (formData.get('category_id') as string) || null
  const sku             = (formData.get('sku') as string) || null
  const material        = (formData.get('material') as string) || null
  const made_in         = (formData.get('made_in') as string) || 'México'
  const is_featured     = formData.get('is_featured') === 'on'
  const is_new          = formData.get('is_new') === 'on'
  const sold_out        = formData.get('sold_out') === 'on'

  const { data: product, error } = await supabase
    .from('products')
    .insert({ name, slug, description, price_mxn, original_price_mxn, category_id, sku, material, made_in, is_featured, is_new, sold_out })
    .select('id')
    .single()

  if (error) return { error: error.message }

  await uploadImages(supabase, product.id, formData, 0, false)
  await saveAttributes(supabase, product.id, formData)

  revalidateTag('products')
  redirect('/admin/products')
}

export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = createAdminClient()
  const id = formData.get('id') as string

  const name            = formData.get('name') as string
  const slug            = formData.get('slug') as string
  const description     = (formData.get('description') as string) || null
  const price_mxn       = parseFloat(formData.get('price_mxn') as string)
  const origPrice       = formData.get('original_price_mxn') as string
  const original_price_mxn = origPrice ? parseFloat(origPrice) : null
  const category_id     = (formData.get('category_id') as string) || null
  const sku             = (formData.get('sku') as string) || null
  const material        = (formData.get('material') as string) || null
  const made_in         = (formData.get('made_in') as string) || 'México'
  const is_featured     = formData.get('is_featured') === 'on'
  const is_new          = formData.get('is_new') === 'on'
  const sold_out        = formData.get('sold_out') === 'on'

  const { error } = await supabase
    .from('products')
    .update({ name, slug, description, price_mxn, original_price_mxn, category_id, sku, material, made_in, is_featured, is_new, sold_out })
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

  await uploadImages(supabase, id, formData, baseOrder, hasPrimary)
  await saveAttributes(supabase, id, formData)

  revalidateTag('products')
  redirect('/admin/products')
}

type SupabaseClient = ReturnType<typeof createAdminClient>

async function uploadImages(
  supabase: SupabaseClient,
  productId: string,
  formData: FormData,
  baseOrder: number,
  hasPrimary: boolean
) {
  const files = formData.getAll('images') as File[]
  const validFiles = files.filter(f => f instanceof File && f.size > 0)

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${productId}/${Date.now()}-${i}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) continue

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    await supabase.from('product_images').insert({
      product_id: productId,
      url:        publicUrl,
      is_primary: !hasPrimary && i === 0,
      sort_order: baseOrder + i,
    })
  }
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
