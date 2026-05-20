'use server'
import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdminSession } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionState = { error: string } | null

export async function updatePickupPoint(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdminSession()
  const supabase = createAdminClient()
  const id = formData.get('id') as string

  const name               = formData.get('name') as string
  const address            = formData.get('address') as string
  const city               = formData.get('city') as string
  const state              = formData.get('state') as string
  const type               = formData.get('type') as string
  const additional_cost_mxn = parseFloat(formData.get('additional_cost_mxn') as string) || 0
  const available_hours    = (formData.get('available_hours') as string) || null
  const estimated_days     = (formData.get('estimated_days') as string) || null
  const is_active          = formData.get('is_active') === 'on'

  const { error } = await supabase
    .from('pickup_points')
    .update({ name, address, city, state, type, additional_cost_mxn, available_hours, estimated_days, is_active })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidateTag('pickup-points')
  redirect('/admin/pickup-points')
}

export async function togglePickupPoint(id: string, is_active: boolean) {
  await requireAdminSession()
  const supabase = createAdminClient()
  await supabase.from('pickup_points').update({ is_active }).eq('id', id)
  revalidateTag('pickup-points')
}
