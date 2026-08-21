import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createStudioSignedUrls } from '@/lib/studio/storage'
import type { GenerationKind, ShotType } from '@/lib/studio/constants'
import StudioWorkspace from '../_components/StudioWorkspace'

export const dynamic = 'force-dynamic'

export default async function AdminStudioProductPage({
  params,
}: {
  params: { productId: string }
}) {
  const supabase = createAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, price_mxn')
    .eq('id', params.productId)
    .maybeSingle()

  if (!product) notFound()

  const [{ data: raws }, { data: gens }] = await Promise.all([
    supabase
      .from('studio_raw_photos')
      .select('id, shot_type, storage_path')
      .eq('product_id', product.id),
    supabase
      .from('studio_generations')
      .select('id, kind, status, model, clean_wear, storage_path, created_at')
      .eq('product_id', product.id)
      .neq('status', 'discarded')
      .order('created_at', { ascending: false }),
  ])

  const paths = [
    ...(raws ?? []).map((r) => r.storage_path),
    ...(gens ?? []).map((g) => g.storage_path),
  ]
  const signed = await createStudioSignedUrls(supabase, paths)

  return (
    <StudioWorkspace
      product={product}
      rawPhotos={(raws ?? []).map((r) => ({
        id: r.id,
        shot_type: r.shot_type as ShotType,
        signedUrl: signed.get(r.storage_path) ?? null,
      }))}
      generations={(gens ?? []).map((g) => ({
        id: g.id,
        kind: g.kind as GenerationKind,
        status: g.status as 'pending' | 'approved' | 'discarded',
        model: g.model,
        clean_wear: g.clean_wear,
        signedUrl: signed.get(g.storage_path) ?? null,
        created_at: g.created_at,
      }))}
    />
  )
}
