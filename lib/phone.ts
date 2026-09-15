/**
 * Normalización de teléfonos a formato internacional.
 *
 * Se normaliza AL GUARDAR, no al leer: teléfonos en formatos mezclados dentro
 * de la misma columna son un dolor de migrar después. Todo entra como +52…
 *
 * México, resumen de lo que llega en la práctica:
 *   55 1234 5678        → +525512345678   (10 dígitos, lo normal)
 *   044 55 1234 5678    → +525512345678   (prefijo viejo de celular, ya no existe)
 *   045 55 1234 5678    → +525512345678   (ídem)
 *   1 55 1234 5678      → +525512345678   (el "1" de larga distancia que WhatsApp
 *                                          agregaba; Stripe/WhatsApp ya no lo usan)
 *   +52 1 55 1234 5678  → +525512345678
 */

const MX_COUNTRY = '52'

export interface PhoneResult {
  ok: boolean
  e164?: string
  error?: string
}

export function normalizePhone(raw: string, defaultCountry = MX_COUNTRY): PhoneResult {
  const input = (raw ?? '').trim()
  if (!input) return { ok: false, error: 'El WhatsApp es obligatorio' }

  const hadPlus = input.startsWith('+')
  let digits = input.replace(/\D/g, '')

  if (!digits) return { ok: false, error: 'El WhatsApp solo debe contener números' }

  if (hadPlus) {
    // Ya viene con lada de país. Solo se limpia el "1" mexicano heredado.
    if (digits.startsWith(MX_COUNTRY)) digits = MX_COUNTRY + stripMxLegacy(digits.slice(2))
  } else {
    // Prefijos locales de México que hay que quitar antes de agregar la lada.
    if (digits.startsWith('044') || digits.startsWith('045')) digits = digits.slice(3)
    if (digits.startsWith(MX_COUNTRY) && digits.length > 10) {
      digits = MX_COUNTRY + stripMxLegacy(digits.slice(2))
    } else {
      digits = defaultCountry + stripMxLegacy(digits)
    }
  }

  if (digits.length < 11 || digits.length > 15) {
    return { ok: false, error: 'El WhatsApp debe tener 10 dígitos (ej. 55 1234 5678)' }
  }

  if (digits.startsWith(MX_COUNTRY) && digits.length !== 12) {
    return { ok: false, error: 'Un número de México debe tener 10 dígitos (ej. 55 1234 5678)' }
  }

  return { ok: true, e164: `+${digits}` }
}

/** Quita el "1" que se anteponía a los celulares mexicanos hasta 2019. */
function stripMxLegacy(national: string): string {
  return national.length === 11 && national.startsWith('1') ? national.slice(1) : national
}

/** Formato legible para el admin: +52 55 1234 5678 */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return '—'
  const d = e164.replace(/\D/g, '')
  if (d.length === 12 && d.startsWith(MX_COUNTRY)) {
    return `+52 ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8)}`
  }
  return e164
}

/** Link de WhatsApp a un clic desde el admin. */
export function whatsappLink(e164: string | null | undefined, message?: string): string | null {
  if (!e164) return null
  const d = e164.replace(/\D/g, '')
  if (!d) return null
  return `https://wa.me/${d}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
