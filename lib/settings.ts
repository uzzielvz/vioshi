import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Parámetros de negocio editables desde /admin/settings.
 *
 * Ninguno de estos números debe aparecer hardcodeado en otro archivo:
 * se cambian sin desplegar código.
 */
export interface BusinessSettings {
  card_only_threshold_mxn: number
  card_reserve_minutes: number
  voucher_hours: number
  manual_hold_days: number
}

/** Valores de respaldo si la tabla no responde. Iguales a los DEFAULT de 0012. */
const FALLBACK: BusinessSettings = {
  card_only_threshold_mxn: 500,
  card_reserve_minutes: 20,
  voucher_hours: 24,
  manual_hold_days: 3,
}

export async function getSettings(): Promise<BusinessSettings> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('settings')
    .select('card_only_threshold_mxn, card_reserve_minutes, voucher_hours, manual_hold_days')
    .eq('id', true)
    .single()

  if (error || !data) {
    console.error('[settings] lectura falló, usando respaldo:', error?.message)
    return FALLBACK
  }

  return {
    card_only_threshold_mxn: Number(data.card_only_threshold_mxn),
    card_reserve_minutes: Number(data.card_reserve_minutes),
    voucher_hours: Number(data.voucher_hours),
    manual_hold_days: Number(data.manual_hold_days),
  }
}

/**
 * Regla de umbral: arriba de cierto monto solo se acepta tarjeta.
 *
 * Un voucher de OXXO inmoviliza la prenda 24 h sin garantía de pago; en montos
 * altos el costo de oportunidad no compensa. Se valida en el SERVIDOR — ocultar
 * el botón en el cliente no es una medida de seguridad.
 */
export function isCardOnly(totalMxn: number, settings: BusinessSettings): boolean {
  return totalMxn > settings.card_only_threshold_mxn
}

/** Métodos que Stripe debe ocultar cuando aplica la regla de umbral. */
export const DEFERRED_PAYMENT_METHODS = ['oxxo', 'customer_balance'] as const
