/** How long ago a piece was first published. No reviews: Fase 1 forbids them. */

export type PostedUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function postedAgo(
  publishedAt: string,
  now: number,
): { count: number; unit: PostedUnit } | null {
  const then = new Date(publishedAt).getTime()
  if (!Number.isFinite(then)) return null
  const delta = now - then
  if (delta < MINUTE) return { count: 1, unit: 'minute' }

  const minutes = Math.floor(delta / MINUTE)
  if (minutes < 60) return { count: minutes, unit: 'minute' }

  const hours = Math.floor(delta / HOUR)
  if (hours < 24) return { count: hours, unit: 'hour' }

  const days = Math.floor(delta / DAY)
  if (days < 7) return { count: days, unit: 'day' }
  if (days < 30) return { count: Math.floor(days / 7), unit: 'week' }

  const months = Math.floor(days / 30)
  if (months < 12) return { count: Math.max(1, months), unit: 'month' }

  return { count: Math.max(1, Math.floor(days / 365)), unit: 'year' }
}
