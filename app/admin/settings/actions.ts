'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/admin/session'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionState = { error: string } | { ok: string } | null

/**
 * Parámetros de negocio. Ninguno vive hardcodeado en el código: se cambian
 * aquí sin desplegar nada.
 */
export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdminSession()

  const num = (k: string) => Number((formData.get(k) as string) ?? '')

  const umbral = num('card_only_threshold_mxn')
  const tarjeta = num('card_reserve_minutes')
  const spei = num('spei_reserve_minutes')
  const voucher = num('voucher_hours')
  const manual = num('manual_hold_days')

  if (!Number.isFinite(umbral) || umbral < 0) return { error: 'El umbral debe ser un número ≥ 0' }
  // El mínimo de 30 no es arbitrario: Stripe Checkout no permite que una sesión
  // expire antes de 30 minutos, y reserva y sesión deben vencer juntas.
  if (!Number.isInteger(tarjeta) || tarjeta < 30 || tarjeta > 240)
    return { error: 'La ventana de tarjeta debe estar entre 30 y 240 minutos (Stripe no permite menos de 30)' }
  if (!Number.isInteger(spei) || spei < 15 || spei > 1440)
    return { error: 'La ventana de SPEI debe estar entre 15 y 1440 minutos' }
  if (!Number.isInteger(voucher) || voucher < 1 || voucher > 168)
    return { error: 'La vigencia de OXXO debe estar entre 1 y 168 horas' }
  if (!Number.isInteger(manual) || manual < 1 || manual > 30)
    return { error: 'El apartado manual debe estar entre 1 y 30 días' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('settings')
    .update({
      card_only_threshold_mxn: umbral,
      card_reserve_minutes: tarjeta,
      spei_reserve_minutes: spei,
      voucher_hours: voucher,
      manual_hold_days: manual,
    })
    .eq('id', true)

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  return { ok: 'Guardado' }
}
