'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_STYLE_REFS,
  PRODUCT_IMAGES_BUCKET,
  SHOT_TYPES,
  STUDIO_BUCKET,
  type ShotType,
} from '@/lib/studio/constants'

type ActionState = { error: string } | null

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extFromFile(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName === 'png' || fromName === 'webp' || fromName === 'jpg' || fromName === 'jpeg') {
    return fromName === 'jpeg' ? 'jpg' : fromName
  }
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

function validateImage(file: File | null): string | null {
  if (!file || !(file instanceof File) || file.size === 0) return 'Selecciona una imagen'
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return 'Tipo no permitido (usa JPEG, PNG o WebP)'
  }
  if (file.size > MAX_IMAGE_BYTES) return 'La imagen supera 5 MB'
  return null
}

export async function createMinimalProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const priceRaw = formData.get('price_mxn') as string | null
  const price_mxn = priceRaw ? parseFloat(priceRaw) : NaN

  if (!name) return { error: 'El nombre es obligatorio' }
  if (!Number.isFinite(price_mxn) || price_mxn <= 0) {
    return { error: 'El precio en MXN debe ser mayor a 0' }
  }

  let slug = toSlug(name) || `pieza-${Date.now()}`

  const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle()
  if (existing) slug = `${slug}-${Date.now().toString(36)}`

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      price_mxn,
      sold_out: true,
      made_in: 'México',
    })
    .select('id')
    .single()

  if (error || !product) {
    if (error?.code === '23505') return { error: 'Ya existe un producto con ese slug' }
    return { error: error?.message ?? 'No se pudo crear el producto' }
  }

  revalidatePath('/admin/studio')
  redirect(`/admin/studio/${product.id}`)
}

export async function uploadStyleRef(formData: FormData): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const file = formData.get('file') as File | null
  const invalid = validateImage(file)
  if (invalid) return { error: invalid }

  const { count } = await supabase
    .from('studio_style_refs')
    .select('id', { count: 'exact', head: true })

  if ((count ?? 0) >= MAX_STYLE_REFS) {
    return { error: `Máximo ${MAX_STYLE_REFS} fotos de referencia` }
  }

  const { data: last } = await supabase
    .from('studio_style_refs')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)

  const sort_order = (last?.[0]?.sort_order ?? -1) + 1
  const id = crypto.randomUUID()
  const path = `style-refs/${id}.${extFromFile(file!)}`
  const buffer = Buffer.from(await file!.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(STUDIO_BUCKET)
    .upload(path, buffer, { contentType: file!.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { error: insertError } = await supabase.from('studio_style_refs').insert({
    id,
    storage_path: path,
    sort_order,
  })

  if (insertError) {
    await supabase.storage.from(STUDIO_BUCKET).remove([path])
    return { error: insertError.message }
  }

  revalidatePath('/admin/studio')
  return null
}

export async function deleteStyleRef(id: string): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const { data: row } = await supabase
    .from('studio_style_refs')
    .select('id, storage_path')
    .eq('id', id)
    .maybeSingle()

  if (!row) return { error: 'Referencia no encontrada' }

  await supabase.storage.from(STUDIO_BUCKET).remove([row.storage_path])
  const { error } = await supabase.from('studio_style_refs').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/studio')
  return null
}

export async function uploadRawPhoto(formData: FormData): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const productId = formData.get('productId') as string | null
  const shotType = formData.get('shotType') as string | null
  const file = formData.get('file') as File | null

  if (!productId) return { error: 'Falta el producto' }
  if (!shotType || !SHOT_TYPES.includes(shotType as ShotType)) {
    return { error: 'Tipo de foto inválido' }
  }

  const invalid = validateImage(file)
  if (invalid) return { error: invalid }

  const { data: product } = await supabase.from('products').select('id').eq('id', productId).maybeSingle()
  if (!product) return { error: 'Producto no encontrado' }

  const { data: existing } = await supabase
    .from('studio_raw_photos')
    .select('id, storage_path')
    .eq('product_id', productId)
    .eq('shot_type', shotType)
    .maybeSingle()

  const id = existing?.id ?? crypto.randomUUID()
  const path = `raw/${productId}/${shotType}-${Date.now()}.${extFromFile(file!)}`
  const buffer = Buffer.from(await file!.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(STUDIO_BUCKET)
    .upload(path, buffer, { contentType: file!.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  if (existing) {
    const { error: updateError } = await supabase
      .from('studio_raw_photos')
      .update({ storage_path: path })
      .eq('id', existing.id)

    if (updateError) {
      await supabase.storage.from(STUDIO_BUCKET).remove([path])
      return { error: updateError.message }
    }

    await supabase.storage.from(STUDIO_BUCKET).remove([existing.storage_path])
  } else {
    const { error: insertError } = await supabase.from('studio_raw_photos').insert({
      id,
      product_id: productId,
      shot_type: shotType,
      storage_path: path,
    })

    if (insertError) {
      await supabase.storage.from(STUDIO_BUCKET).remove([path])
      return { error: insertError.message }
    }
  }

  revalidatePath(`/admin/studio/${productId}`)
  return null
}

export async function copyRawPhoto(
  productId: string,
  fromShot: ShotType,
  toShot: ShotType
): Promise<ActionState> {
  await requireAdminSession()
  if (fromShot === toShot) return null
  if (!SHOT_TYPES.includes(fromShot) || !SHOT_TYPES.includes(toShot)) {
    return { error: 'Tipo de foto inválido' }
  }

  const supabase = createAdminClient()

  const { data: source } = await supabase
    .from('studio_raw_photos')
    .select('storage_path')
    .eq('product_id', productId)
    .eq('shot_type', fromShot)
    .maybeSingle()

  if (!source) return { error: 'No hay foto para copiar' }

  const { data: blob, error: downloadError } = await supabase.storage
    .from(STUDIO_BUCKET)
    .download(source.storage_path)

  if (downloadError || !blob) {
    return { error: downloadError?.message ?? 'No se pudo leer la foto' }
  }

  const ext = source.storage_path.split('.').pop() || 'jpg'
  const mime =
    blob.type && blob.type.startsWith('image/')
      ? blob.type
      : ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : 'image/jpeg'
  const file = new File([blob], `${toShot}.${ext}`, { type: mime })
  const fd = new FormData()
  fd.set('productId', productId)
  fd.set('shotType', toShot)
  fd.set('file', file)
  return uploadRawPhoto(fd)
}

export async function deleteRawPhoto(id: string, productId: string): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const { data: row } = await supabase
    .from('studio_raw_photos')
    .select('id, storage_path')
    .eq('id', id)
    .eq('product_id', productId)
    .maybeSingle()

  if (!row) return { error: 'Foto no encontrada' }

  await supabase.storage.from(STUDIO_BUCKET).remove([row.storage_path])
  const { error } = await supabase.from('studio_raw_photos').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/admin/studio/${productId}`)
  return null
}

export async function discardGeneration(id: string, productId: string): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const { data: row } = await supabase
    .from('studio_generations')
    .select('id, storage_path, status')
    .eq('id', id)
    .eq('product_id', productId)
    .maybeSingle()

  if (!row) return { error: 'Generación no encontrada' }
  if (row.status === 'approved') return { error: 'No se puede descartar una imagen ya aprobada' }

  await supabase
    .from('studio_generations')
    .update({ status: 'discarded' })
    .eq('id', id)

  await supabase.storage.from(STUDIO_BUCKET).remove([row.storage_path])
  revalidatePath(`/admin/studio/${productId}`)
  return null
}

export async function approveGeneration(id: string, productId: string): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const { data: row } = await supabase
    .from('studio_generations')
    .select('id, kind, status, storage_path, product_image_id')
    .eq('id', id)
    .eq('product_id', productId)
    .maybeSingle()

  if (!row) return { error: 'Generación no encontrada' }
  if (row.status === 'approved' && row.product_image_id) {
    return { error: 'Esta imagen ya está en la tienda' }
  }
  if (row.status === 'discarded') return { error: 'Esta imagen fue descartada' }

  const { data: blob, error: downloadError } = await supabase.storage
    .from(STUDIO_BUCKET)
    .download(row.storage_path)

  if (downloadError || !blob) {
    return { error: downloadError?.message ?? 'No se pudo leer el draft' }
  }

  const ext = row.storage_path.split('.').pop() ?? 'png'
  const dest = `${productId}/studio-${row.id}.${ext}`
  const buffer = Buffer.from(await blob.arrayBuffer())
  const contentType = blob.type || 'image/png'

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(dest, buffer, { contentType, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(dest)

  const isPrimary = row.kind === 'catalog'

  if (isPrimary) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
  }

  const { data: last } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sort_order = (last?.[0]?.sort_order ?? -1) + 1

  const { data: inserted, error: insertError } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      url: publicUrl,
      alt: row.kind === 'catalog' ? 'Catálogo' : 'Modelo',
      is_primary: isPrimary,
      sort_order,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([dest])
    return { error: insertError?.message ?? 'No se pudo publicar la imagen' }
  }

  const { error: updateError } = await supabase
    .from('studio_generations')
    .update({ status: 'approved', product_image_id: inserted.id })
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  revalidateTag('products')
  revalidatePath(`/admin/studio/${productId}`)
  revalidatePath('/admin/products')
  return null
}

export async function replaceGenerationImage(formData: FormData): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const productId = formData.get('productId') as string | null
  const generationId = formData.get('generationId') as string | null
  const file = formData.get('file') as File | null

  if (!productId || !generationId) return { error: 'Faltan datos' }
  const invalid = validateImage(file)
  if (invalid) return { error: invalid }

  const { data: row } = await supabase
    .from('studio_generations')
    .select('id, storage_path, status')
    .eq('id', generationId)
    .eq('product_id', productId)
    .maybeSingle()

  if (!row) return { error: 'Generación no encontrada' }
  if (row.status === 'approved') return { error: 'Ya está en la tienda. Recorta antes de aprobar.' }
  if (row.status === 'discarded') return { error: 'Esta imagen fue descartada' }

  const path = `generations/${productId}/${generationId}-crop-${Date.now()}.${extFromFile(file!)}`
  const buffer = Buffer.from(await file!.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(STUDIO_BUCKET)
    .upload(path, buffer, { contentType: file!.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { error: updateError } = await supabase
    .from('studio_generations')
    .update({ storage_path: path })
    .eq('id', generationId)

  if (updateError) {
    await supabase.storage.from(STUDIO_BUCKET).remove([path])
    return { error: updateError.message }
  }

  await supabase.storage.from(STUDIO_BUCKET).remove([row.storage_path])
  revalidatePath(`/admin/studio/${productId}`)
  return null
}
