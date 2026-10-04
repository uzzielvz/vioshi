'use server'

import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { getAdminActor, requireFullAdmin } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizePhone } from '@/lib/phone'

type ActionState = { error: string } | { ok: string } | null

function refrescar() {
  revalidateTag('products')
  revalidatePath('/admin/reservas')
  revalidatePath('/admin/products')
}

/** Marcar vendida / disponible en un clic (ventas presenciales). */
export async function toggleSoldAction(productId: string, vendida: boolean) {
  const actor = await getAdminActor()
  const supabase = createAdminClient()

  const patch = vendida
    ? {
        sold_out: true,
        reserved_order_id: null,
        reserved_at: null,
        reserved_until: null,
        reservation_kind: null,
        reserved_contact_name: null,
        reserved_contact_phone: null,
      }
    : { sold_out: false, sold_order_id: null }

  let query = supabase.from('products').update(patch).eq('id', productId)
  if (actor === 'mario') query = query.eq('owner', 'mario')
  await query

  refrescar()
}

/** Liberar una reserva atorada. */
export async function releaseReservationAction(productId: string) {
  await requireFullAdmin()
  const supabase = createAdminClient()
  await supabase.rpc('admin_release_product', { p_product_id: productId })
  refrescar()
}

/** Apartado manual: venta por DM con anticipo. */
export async function createManualHoldAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireFullAdmin()

  const productId = (formData.get('product_id') as string)?.trim()
  const nombre = (formData.get('contact_name') as string)?.trim()
  const telefonoRaw = (formData.get('contact_phone') as string)?.trim()
  const hasta = (formData.get('until') as string)?.trim()

  if (!productId) return { error: 'Selecciona una prenda' }
  if (!nombre) return { error: 'El nombre del cliente es obligatorio' }

  const telefono = normalizePhone(telefonoRaw ?? '')
  if (!telefono.ok) return { error: telefono.error ?? 'WhatsApp inválido' }

  const supabase = createAdminClient()
  const { error } = await supabase.rpc('admin_manual_hold', {
    p_product_id: productId,
    p_name: nombre,
    p_phone: telefono.e164,
    p_until: hasta ? new Date(hasta).toISOString() : null,
  })

  if (error) {
    if (error.message.includes('product_unavailable')) {
      return { error: 'Esa prenda ya está vendida o apartada por alguien más' }
    }
    return { error: error.message }
  }

  refrescar()
  return { ok: `Apartada para ${nombre}` }
}

/** Resolver un registro de dinero atrapado. */
export async function resolveOrphanFundAction(
  id: string,
  status: 'reembolsado' | 'aplicado' | 'ignorado',
  notes?: string
) {
  await requireFullAdmin()
  const supabase = createAdminClient()
  await supabase
    .from('orphan_funds')
    .update({ status, notes: notes || null, resolved_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/admin/fondos')
}

/** Cierra un pedido marcado para revisión manual. */
export async function clearReviewFlagAction(orderId: string) {
  await requireFullAdmin()
  const supabase = createAdminClient()
  await supabase.from('orders').update({ needs_review: false }).eq('id', orderId)
  revalidatePath('/admin/reservas')
}

/**
 * Marca el handoff físico del pedido (recogido o entregado). Solo cambia
 * `orders.status`; no toca Stripe ni el pago — eso lo resuelve el webhook.
 * `delivered` es un valor válido del CHECK de `0001_initial_schema.sql`.
 *
 * El pedido DEBE estar cobrado. El filtro va en el UPDATE, no en un `select`
 * previo: la lista de "por entregar" ya filtra por pago, pero una Server Action
 * no se protege con lo que muestre una lista, y un select + update en dos pasos
 * es una carrera. Cuando Connect cuelgue el payout de este botón, un pedido sin
 * cobrar marcado como entregado se convierte en dinero transferido de más.
 */
export async function markOrderDeliveredAction(orderId: string) {
  await requireFullAdmin()
  const supabase = createAdminClient()

  await supabase
    .from('orders')
    .update({ status: 'delivered' })
    .eq('id', orderId)
    .eq('payment_status', 'completed')
    .not('status', 'in', '(delivered,cancelled)')

  revalidatePath('/admin/reservas')
}
