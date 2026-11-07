/**
 * Sale price shown on the store.
 *
 * `original_price_mxn` already exists (0001). The panel writes it only when
 * a price goes down, so the struck figure is the price the piece just left.
 * A raise clears it. Saving without a change keeps a strike that is still
 * above the current price.
 */

export function asMoney(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return null
  return Math.round(n * 100) / 100
}

function cents(value: number): number {
  return Math.round(value * 100)
}

export function nextOriginalPrice(
  currentPrice: number | null,
  currentOriginal: number | null,
  nextPrice: number | null,
): number | null {
  if (nextPrice == null || currentPrice == null) return null
  const next = asMoney(nextPrice)
  const current = asMoney(currentPrice)
  if (next == null || current == null) return null
  if (cents(next) < cents(current)) return current
  if (cents(next) > cents(current)) return null
  const original = asMoney(currentOriginal)
  if (original != null && cents(original) > cents(next)) return original
  return null
}

/** Struck price, only when it is strictly above what the piece costs now. */
export function compareAtPrice(
  price: number,
  original: string | number | null | undefined,
): number | undefined {
  const now = asMoney(price)
  const was = asMoney(original)
  if (now == null || was == null) return undefined
  if (cents(was) > cents(now)) return was
  return undefined
}
