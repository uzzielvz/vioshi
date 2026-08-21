/**
 * Admin session tokens: HMAC-SHA256 signed payload in cookie `admin_token`.
 * Uses Web Crypto (Edge middleware + Node Server Actions).
 * Cookie value never contains ADMIN_SECRET.
 */

export const ADMIN_SESSION_MAX_AGE_SEC = 604800 // 7 days

const ADMIN_SESSION_VERSION = 1
const COOKIE_NAME = 'admin_token'

function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET
  return secret && secret.length > 0 ? secret : null
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(str: string): Uint8Array | null {
  try {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    const binary = atob(padded + pad)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    return null
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function signPayload(payloadB64: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64))
  return toBase64Url(new Uint8Array(sig))
}

async function verifySignature(
  payloadB64: string,
  sigB64: string,
  secret: string
): Promise<boolean> {
  const sigBytes = fromBase64Url(sigB64)
  if (!sigBytes) return false
  const key = await importHmacKey(secret)
  return crypto.subtle.verify(
    'HMAC',
    key,
    Uint8Array.from(sigBytes),
    new TextEncoder().encode(payloadB64)
  )
}

type SessionPayload = { v: number; exp: number }

function parsePayload(payloadB64: string): SessionPayload | null {
  const bytes = fromBase64Url(payloadB64)
  if (!bytes) return null
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SessionPayload
    if (parsed.v !== ADMIN_SESSION_VERSION) return null
    if (typeof parsed.exp !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

/** Create a signed session token after successful password check. */
export async function createAdminSessionToken(): Promise<string> {
  const secret = getAdminSecret()
  if (!secret) throw new Error('ADMIN_SECRET is not configured')

  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    v: ADMIN_SESSION_VERSION,
    exp: now + ADMIN_SESSION_MAX_AGE_SEC,
  }
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const sigB64 = await signPayload(payloadB64, secret)
  return `${payloadB64}.${sigB64}`
}

/** Verify signed token (signature + expiry). Legacy plaintext cookies are rejected. */
export async function verifyAdminSessionToken(token?: string): Promise<boolean> {
  if (!token) return false
  const secret = getAdminSecret()
  if (!secret) return false

  const dot = token.indexOf('.')
  if (dot <= 0 || dot === token.length - 1) return false

  const payloadB64 = token.slice(0, dot)
  const sigB64 = token.slice(dot + 1)

  if (!(await verifySignature(payloadB64, sigB64, secret))) return false

  const payload = parsePayload(payloadB64)
  if (!payload) return false

  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}

/** Server Actions: redirect to login if session is invalid. */
export async function requireAdminSession(): Promise<void> {
  const { cookies } = await import('next/headers')
  const { redirect } = await import('next/navigation')
  const token = cookies().get(COOKIE_NAME)?.value
  if (!(await verifyAdminSessionToken(token))) {
    redirect('/admin/login')
  }
}

/** Route Handlers: return false so the caller can send 401 JSON (no redirect). */
export async function requireAdminApiSession(): Promise<boolean> {
  const { cookies } = await import('next/headers')
  const token = cookies().get(COOKIE_NAME)?.value
  return verifyAdminSessionToken(token)
}
