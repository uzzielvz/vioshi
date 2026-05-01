import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import PickupPointForm from '../_components/PickupPointForm'

export const dynamic = 'force-dynamic'

export default async function EditPickupPointPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: point } = await supabase
    .from('pickup_points')
    .select('id, name, address, city, state, type, additional_cost_mxn, available_hours, estimated_days, is_active')
    .eq('id', id)
    .single()

  if (!point) notFound()

  return <PickupPointForm point={point} />
}
