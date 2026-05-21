import { headers } from 'next/headers'

/**
 * Origin for OAuth / magic-link redirectTo URLs.
 * Prefer explicit env on deploy; headers() alone can miss x-forwarded-* in Server Actions.
 */
export function getAuthOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  const h = headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto =
    h.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}
