import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApiSession } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { STUDIO_BUCKET } from '@/lib/studio/constants'
import { mimeFromPath } from '@/lib/studio/gemini'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!(await requireAdminApiSession())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')?.trim()
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: row } = await supabase
    .from('studio_generations')
    .select('storage_path, status')
    .eq('id', id)
    .maybeSingle()

  if (!row || row.status === 'discarded') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const { data: blob, error } = await supabase.storage.from(STUDIO_BUCKET).download(row.storage_path)
  if (error || !blob) {
    return NextResponse.json({ error: 'download_failed' }, { status: 500 })
  }

  const mime = blob.type?.startsWith('image/') ? blob.type : mimeFromPath(row.storage_path)
  const buffer = Buffer.from(await blob.arrayBuffer())
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'private, no-store',
    },
  })
}
