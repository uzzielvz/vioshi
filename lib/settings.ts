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
  /** Editable en /admin/settings. Semilla $10 (0017). El monto real es una
   * decisión de negocio abierta: no se hardcodea "el correcto" en otro sitio. */
  home_shipping_mxn: number
}

/**
 * Valores de respaldo si la tabla no responde. `card_reserve_minutes` es 30, no
 * el DEFAULT 20 de 0012: Stripe Checkout no deja expirar una sesión antes de 30
 * minutos y la reserva debe vencer con ella.
 */
const FALLBACK: BusinessSettings = {
  card_only_threshold_mxn: 500,
  card_reserve_minutes: 30,
  voucher_hours: 24,
  manual_hold_days: 3,
  home_shipping_mxn: 10,
}

const COLUMNS =
  'card_only_threshold_mxn, card_reserve_minutes, voucher_hours, manual_hold_days, home_shipping_mxn'

export async function getSettings(): Promise<BusinessSettings> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.from('settings').select(COLUMNS).eq('id', true).single()

  if (error || !data) {
    console.error('[settings] lectura falló, usando respaldo:', error?.message)
    return FALLBACK
  }

  return {
    card_only_threshold_mxn: Number(data.card_only_threshold_mxn),
    card_reserve_minutes: Number(data.card_reserve_minutes),
    voucher_hours: Number(data.voucher_hours),
    manual_hold_days: Number(data.manual_hold_days),
    home_shipping_mxn: Number(data.home_shipping_mxn),
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
