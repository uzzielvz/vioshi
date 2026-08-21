import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiSession } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { blobToStudioImage, describeGarment, mimeFromPath } from '@/lib/studio/gemini'
import { SHOT_LABELS, STUDIO_BUCKET, type ShotType } from '@/lib/studio/constants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'missing_gemini_key' }, { status: 503 })
  }

  let body: { productId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const productId = body.productId?.trim()
  if (!productId) {
    return NextResponse.json({ error: 'missing_product' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: raws, error } = await supabase
    .from('studio_raw_photos')
    .select('shot_type, storage_path')
    .eq('product_id', productId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!raws || raws.length === 0) {
    return NextResponse.json({ error: 'no_raw_photos' }, { status: 400 })
  }

  try {
    const images = []
    for (const raw of raws) {
      const { data: blob, error: dlError } = await supabase.storage
        .from(STUDIO_BUCKET)
        .download(raw.storage_path)
      if (dlError || !blob) continue
      const label = SHOT_LABELS[raw.shot_type as ShotType] ?? raw.shot_type
      images.push(await blobToStudioImage(blob, mimeFromPath(raw.storage_path), label))
    }

    if (images.length === 0) {
      return NextResponse.json({ error: 'raw_download_failed' }, { status: 500 })
    }

    const description = await describeGarment(images)
    return NextResponse.json({ description })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'describe_failed'
    const status = message === 'description_failed' ? 502 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
