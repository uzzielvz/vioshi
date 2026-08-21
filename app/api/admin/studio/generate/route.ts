import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiSession } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  checkRateLimit,
  getClientIp,
  retryAfterSeconds,
  STUDIO_GENERATE_RATE_LIMIT,
} from '@/lib/rate-limit'
import {
  FLASH_IMAGE_MODEL,
  SHOT_LABELS,
  STUDIO_BUCKET,
  type GenerationKind,
  type ImageQuality,
  type ModelGender,
  type ShotType,
} from '@/lib/studio/constants'
import {
  blobToStudioImage,
  generateStudioImage,
  mimeFromPath,
} from '@/lib/studio/gemini'
import { loadBundledCatalogRefs } from '@/lib/studio/catalogRefs'
import { createStudioSignedUrl } from '@/lib/studio/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

type GenerateBody = {
  productId?: string
  kind?: string
  quality?: string
  cleanWear?: boolean
  gender?: string
  description?: string
  poseIndex?: number
  changeNote?: string
}

export async function POST(req: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const ip = getClientIp(req)
  const rl = checkRateLimit(`studio-generate:${ip}`, STUDIO_GENERATE_RATE_LIMIT)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds(rl.resetAt)) } }
    )
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'missing_gemini_key' }, { status: 503 })
  }

  let body: GenerateBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const productId = body.productId?.trim()
  const kind = body.kind === 'catalog' || body.kind === 'model' ? (body.kind as GenerationKind) : null
  const quality: ImageQuality = body.quality === 'pro' && kind === 'model' ? 'pro' : 'flash'
  const gender: ModelGender = body.gender === 'female' ? 'female' : 'male'
  const cleanWear = true
  const description = body.description?.trim() ?? ''
  const poseIndex = Number.isFinite(body.poseIndex) ? Math.floor(Number(body.poseIndex)) : 0
  const changeNote = typeof body.changeNote === 'string' ? body.changeNote.trim().slice(0, 400) : ''

  if (!productId) return NextResponse.json({ error: 'missing_product' }, { status: 400 })
  if (!kind) return NextResponse.json({ error: 'invalid_kind' }, { status: 400 })
  if (!description) return NextResponse.json({ error: 'missing_description' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: product } = await supabase.from('products').select('id').eq('id', productId).maybeSingle()
  if (!product) return NextResponse.json({ error: 'product_not_found' }, { status: 404 })

  const { data: raws } = await supabase
    .from('studio_raw_photos')
    .select('shot_type, storage_path')
    .eq('product_id', productId)

  if (!raws || raws.length === 0) {
    return NextResponse.json({ error: 'no_raw_photos' }, { status: 400 })
  }

  try {
    const garmentImages = []
    for (const raw of raws) {
      const { data: blob, error: dlError } = await supabase.storage
        .from(STUDIO_BUCKET)
        .download(raw.storage_path)
      if (dlError || !blob) continue
      const label = SHOT_LABELS[raw.shot_type as ShotType] ?? raw.shot_type
      garmentImages.push(await blobToStudioImage(blob, mimeFromPath(raw.storage_path), label))
    }

    if (garmentImages.length === 0) {
      return NextResponse.json({ error: 'raw_download_failed' }, { status: 500 })
    }

    const styleRefs = kind === 'catalog' ? await loadBundledCatalogRefs() : []

    const generated = await generateStudioImage({
      kind,
      quality,
      cleanWear,
      gender,
      garmentDescription: description,
      garmentImages,
      styleRefs,
      poseIndex,
      changeNote: changeNote || undefined,
    })

    const generationId = crypto.randomUUID()
    const ext = generated.mimeType === 'image/webp' ? 'webp' : generated.mimeType === 'image/jpeg' ? 'jpg' : 'png'
    const storagePath = `generations/${productId}/${generationId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(STUDIO_BUCKET)
      .upload(storagePath, generated.buffer, { contentType: generated.mimeType, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: row, error: insertError } = await supabase
      .from('studio_generations')
      .insert({
        id: generationId,
        product_id: productId,
        kind,
        status: 'pending',
        model: generated.model || FLASH_IMAGE_MODEL,
        clean_wear: cleanWear,
        garment_description: description,
        prompt_snapshot: generated.prompt,
        storage_path: storagePath,
      })
      .select('id, kind, status, model, clean_wear, created_at')
      .single()

    if (insertError || !row) {
      await supabase.storage.from(STUDIO_BUCKET).remove([storagePath])
      return NextResponse.json({ error: insertError?.message ?? 'insert_failed' }, { status: 500 })
    }

    const signedUrl = await createStudioSignedUrl(supabase, storagePath)

    return NextResponse.json({
      generation: {
        ...row,
        signedUrl,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generate_failed'
    const status = message === 'image_failed' ? 502 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
