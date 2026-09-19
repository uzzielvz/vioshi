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
  /** Editable en /admin/settings (paquete A1). Semilla $10 hasta que la
   * columna `home_shipping_mxn` exista en `settings` — ver BLOQUEO en
   * docs/agents/STATUS.md (falta número de migración). */
  home_shipping_mxn: number
}

/** Valores de respaldo si la tabla no responde. Iguales a los DEFAULT de 0012. */
const FALLBACK: BusinessSettings = {
  card_only_threshold_mxn: 500,
  card_reserve_minutes: 20,
  voucher_hours: 24,
  manual_hold_days: 3,
  home_shipping_mxn: 10,
}

const BASE_COLUMNS = 'card_only_threshold_mxn, card_reserve_minutes, voucher_hours, manual_hold_days'

export async function getSettings(): Promise<BusinessSettings> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('settings')
    .select(`${BASE_COLUMNS}, home_shipping_mxn`)
    .eq('id', true)
    .single()

  if (!error && data) {
    return {
      card_only_threshold_mxn: Number(data.card_only_threshold_mxn),
      card_reserve_minutes: Number(data.card_reserve_minutes),
      voucher_hours: Number(data.voucher_hours),
      manual_hold_days: Number(data.manual_hold_days),
      home_shipping_mxn: Number(data.home_shipping_mxn),
    }
  }

  // `home_shipping_mxn` todavía no existe en la tabla (migración pendiente,
  // ver BLOQUEO en STATUS.md): reintenta sin esa columna para no perder el
  // resto de los settings mientras la migración no aterriza.
  const fallback = await supabase.from('settings').select(BASE_COLUMNS).eq('id', true).single()

  if (fallback.error || !fallback.data) {
    console.error('[settings] lectura falló, usando respaldo:', fallback.error?.message)
    return FALLBACK
  }

  return {
    card_only_threshold_mxn: Number(fallback.data.card_only_threshold_mxn),
    card_reserve_minutes: Number(fallback.data.card_reserve_minutes),
    voucher_hours: Number(fallback.data.voucher_hours),
    manual_hold_days: Number(fallback.data.manual_hold_days),
    home_shipping_mxn: FALLBACK.home_shipping_mxn,
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
