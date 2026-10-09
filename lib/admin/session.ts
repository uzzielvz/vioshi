/**
 * Admin session tokens: HMAC-SHA256 signed payload in cookie `admin_token`.
 * Uses Web Crypto (Edge middleware + Node Server Actions).
 * Cookie value never contains ADMIN_SECRET.
 */

export const ADMIN_SESSION_MAX_AGE_SEC = 604800 // 7 days

const ADMIN_SESSION_VERSION = 2
const COOKIE_NAME = 'admin_token'

/** Quién entró al panel. Uzziel ve todo; Mario solo su inventario. */
export type AdminActor = 'uzziel' | 'mario'

export function isAdminActor(value: unknown): value is AdminActor {
  return value === 'uzziel' || value === 'mario'
}

function normEmail(value: string): string {
  return value.trim().toLowerCase()
}

/** Correo + contraseña de .env. ADMIN_SECRET solo firma la cookie. */
export function actorFromAdminLogin(email: string, password: string): AdminActor | null {
  const given = normEmail(email)
  if (!given || !password) return null

  const uzzielEmail = normEmail(process.env.UZZIEL_ADMIN_EMAIL ?? '')
  const marioEmail = normEmail(process.env.MARIO_ADMIN_EMAIL ?? '')
  const uzzielPass = process.env.UZZIEL_ADMIN_PASSWORD ?? ''
  const marioPass = process.env.MARIO_ADMIN_PASSWORD ?? ''

  if (uzzielEmail && given === uzzielEmail && uzzielPass && password === uzzielPass) {
    return 'uzziel'
  }
  if (marioEmail && given === marioEmail && marioPass && password === marioPass) {
    return 'mario'
  }
  return null
}

/** Rutas que Mario puede abrir. El resto del panel es de Uzziel. */
export function marioMayEnter(pathname: string): boolean {
  if (pathname === '/admin') return true
  if (pathname.startsWith('/admin/products')) return true
  // Su reporte, con sus propios números: getMovements y getInventoryStats
  // filtran por owner en la consulta.
  if (pathname.startsWith('/admin/reportes')) return true
  if (pathname.startsWith('/admin/logout')) return true
  return false
}

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

type SessionPayload = { v: number; exp: number; actor: AdminActor }

function parsePayload(payloadB64: string): SessionPayload | null {
  const bytes = fromBase64Url(payloadB64)
  if (!bytes) return null
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SessionPayload
    if (parsed.v !== ADMIN_SESSION_VERSION) return null
    if (typeof parsed.exp !== 'number') return null
    if (!isAdminActor(parsed.actor)) return null
    return parsed
  } catch {
    return null
  }
}

/** Create a signed session token after successful password check. */
export async function createAdminSessionToken(actor: AdminActor): Promise<string> {
  const secret = getAdminSecret()
  if (!secret) throw new Error('ADMIN_SECRET is not configured')

  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    v: ADMIN_SESSION_VERSION,
    actor,
    exp: now + ADMIN_SESSION_MAX_AGE_SEC,
  }
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const sigB64 = await signPayload(payloadB64, secret)
  return `${payloadB64}.${sigB64}`
}

export type AdminSession = { actor: AdminActor }

/** Signature + expiry + actor. Tokens without actor (sesión vieja) no sirven. */
export async function readAdminSession(token?: string): Promise<AdminSession | null> {
  if (!token) return null
  const secret = getAdminSecret()
  if (!secret) return null

  const dot = token.indexOf('.')
  if (dot <= 0 || dot === token.length - 1) return null

  const payloadB64 = token.slice(0, dot)
  const sigB64 = token.slice(dot + 1)

  if (!(await verifySignature(payloadB64, sigB64, secret))) return null

  const payload = parsePayload(payloadB64)
  if (!payload) return null

  const now = Math.floor(Date.now() / 1000)
  if (payload.exp <= now) return null
  return { actor: payload.actor }
}

/** Verify signed token (signature + expiry). Legacy plaintext cookies are rejected. */
export async function verifyAdminSessionToken(token?: string): Promise<boolean> {
  return (await readAdminSession(token)) !== null
}

async function actorFromCookie(): Promise<AdminActor | null> {
  const { cookies } = await import('next/headers')
  const token = cookies().get(COOKIE_NAME)?.value
  const session = await readAdminSession(token)
  return session?.actor ?? null
}

/** Layout: no redirige. El login no tiene actor. */
export async function peekAdminActor(): Promise<AdminActor | null> {
  return actorFromCookie()
}

/** Server Actions y páginas: redirige al login si la sesión no vale. */
export async function getAdminActor(): Promise<AdminActor> {
  const { redirect } = await import('next/navigation')
  const actor = await actorFromCookie()
  if (!actor) {
    redirect('/admin/login')
    throw new Error('Unauthenticated')
  }
  return actor
}

/** Pedidos, parámetros, studio, marcas: solo Uzziel. */
export async function requireFullAdmin(): Promise<void> {
  const { redirect } = await import('next/navigation')
  const actor = await getAdminActor()
  if (actor !== 'uzziel') redirect('/admin')
}

/** Server Actions: redirect to login if session is invalid. */
export async function requireAdminSession(): Promise<void> {
  await getAdminActor()
}

/** Route Handlers: 401 unless the caller is Uzziel. Mario no usa APIs de studio. */
export async function requireAdminApiSession(): Promise<boolean> {
  const { cookies } = await import('next/headers')
  const token = cookies().get(COOKIE_NAME)?.value
  const session = await readAdminSession(token)
  return session?.actor === 'uzziel'
}
