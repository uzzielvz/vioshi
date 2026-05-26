'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionState = { error: string } | null

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // 2MB for logos

export async function createBrand(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const name = (formData.get('name') as string || '').trim()
  const slug = (formData.get('slug') as string || '').trim()
  const is_active = formData.get('is_active') === 'on'

  if (!name || !slug) {
    return { error: 'Name and slug are required' }
  }

  // Upload logo if provided
  const logoFile = formData.get('logo') as File | null
  let logo_url: string | null = null

  if (logoFile && logoFile.size > 0) {
    const uploadResult = await uploadBrandLogo(supabase, logoFile, slug)
    if (uploadResult.error) return { error: uploadResult.error }
    logo_url = uploadResult.url
  }

  const { error } = await supabase
    .from('brands')
    .insert({
      name,
      slug,
      logo_url,
      is_active,
    })

  if (error) {
    // Handle unique constraint errors nicely
    if (error.code === '23505') {
      return { error: 'A brand with this name or slug already exists' }
    }
    return { error: error.message }
  }

  revalidateTag('brands')
  redirect('/admin/brands')
}

export async function updateBrand(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()

  const id = formData.get('id') as string
  const name = (formData.get('name') as string || '').trim()
  const slug = (formData.get('slug') as string || '').trim()
  const is_active = formData.get('is_active') === 'on'
  const keepExistingLogo = formData.get('keep_logo') === 'on'

  if (!id || !name || !slug) {
    return { error: 'Missing required fields' }
  }

  let logo_url: string | null = null

  // Handle logo replacement
  const newLogo = formData.get('logo') as File | null

  if (newLogo && newLogo.size > 0) {
    // Delete old logo if exists
    const { data: current } = await supabase
      .from('brands')
      .select('logo_url')
      .eq('id', id)
      .single()

    if (current?.logo_url) {
      await deleteBrandLogo(supabase, current.logo_url)
    }

    const uploadResult = await uploadBrandLogo(supabase, newLogo, slug)
    if (uploadResult.error) return { error: uploadResult.error }
    logo_url = uploadResult.url
  } else if (keepExistingLogo) {
    // Keep existing logo
    const { data: current } = await supabase
      .from('brands')
      .select('logo_url')
      .eq('id', id)
      .single()
    logo_url = current?.logo_url ?? null
  }

  const { error } = await supabase
    .from('brands')
    .update({ name, slug, logo_url, is_active })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A brand with this name or slug already exists' }
    }
    return { error: error.message }
  }

  revalidateTag('brands')
  redirect('/admin/brands')
}

export async function deleteBrand(id: string) {
  await requireAdminSession()
  const supabase = createAdminClient()

  // Get logo to clean up storage
  const { data: brand } = await supabase
    .from('brands')
    .select('logo_url')
    .eq('id', id)
    .single()

  if (brand?.logo_url) {
    await deleteBrandLogo(supabase, brand.logo_url)
  }

  await supabase.from('brands').delete().eq('id', id)

  // Note: We do NOT cascade delete or null brand_id on products here.
  // That decision is left for BR-06 (backfill phase).

  revalidateTag('brands')
}

export async function toggleBrandActive(id: string, is_active: boolean) {
  await requireAdminSession()
  const supabase = createAdminClient()

  await supabase.from('brands').update({ is_active }).eq('id', id)
  revalidateTag('brands')
}

// ============================================================================
// Logo helpers (bucket: brand-logos)
// ============================================================================

type UploadResult = { url: string | null; error?: string }

async function uploadBrandLogo(
  supabase: ReturnType<typeof createAdminClient>,
  file: File,
  brandSlug: string
): Promise<UploadResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { url: null, error: 'Invalid file type. Use PNG, JPG, WebP or SVG.' }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { url: null, error: 'Logo exceeds 2MB limit.' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const path = `${brandSlug}/${Date.now()}-logo.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('brand-logos')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return { url: null, error: `Upload failed: ${uploadError.message}` }
  }

  const { data } = supabase.storage.from('brand-logos').getPublicUrl(path)
  return { url: data.publicUrl }
}

async function deleteBrandLogo(
  supabase: ReturnType<typeof createAdminClient>,
  logoUrl: string
) {
  try {
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brand-logos/`
    if (!logoUrl.startsWith(prefix)) return

    const path = decodeURIComponent(logoUrl.replace(prefix, '').split('?')[0])
    await supabase.storage.from('brand-logos').remove([path])
  } catch {
    // Non-fatal: we don't want to block brand deletion if storage cleanup fails
  }
}
