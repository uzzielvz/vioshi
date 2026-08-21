/**
 * In-memory fixed-window rate limiter (zero dependencies).
 *
 * Best-effort on Vercel: each Edge/Serverless isolate keeps its own Map, so limits
 * are not global across all instances. Sufficient for demo and casual abuse protection.
 * For production-grade limits, replace the store backend with Upstash Redis / Vercel KV
 * while keeping checkRateLimit() as the public API.
 */

export type RateLimitConfig = {
  limit: number
  windowMs: number
}

export type RateLimitResult = {
  success: boolean
  remaining: number
  resetAt: number
}

type Bucket = { count: number; resetAt: number }

const globalStore = globalThis as typeof globalThis & {
  __viogiRateLimit?: Map<string, Bucket>
}

function getStore(): Map<string, Bucket> {
  if (!globalStore.__viogiRateLimit) {
    globalStore.__viogiRateLimit = new Map()
  }
  return globalStore.__viogiRateLimit
}

function pruneExpired(store: Map<string, Bucket>, now: number) {
  if (store.size < 500) return
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key)
  }
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const store = getStore()
  const now = Date.now()
  pruneExpired(store, now)

  let bucket = store.get(key)
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + config.windowMs }
    store.set(key, bucket)
  }

  if (bucket.count >= config.limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count += 1
  return {
    success: true,
    remaining: config.limit - bucket.count,
    resetAt: bucket.resetAt,
  }
}

export function getClientIpFromHeaders(headers: Pick<Headers, 'get'>): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return headers.get('x-real-ip')?.trim() || 'unknown'
}

export function getClientIp(request: Request): string {
  return getClientIpFromHeaders(request.headers)
}

export function retryAfterSeconds(resetAt: number): number {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
}

export const ADMIN_LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 }
export const VISUAL_SEARCH_RATE_LIMIT = { limit: 10, windowMs: 60 * 1000 }
export const STUDIO_GENERATE_RATE_LIMIT = { limit: 20, windowMs: 60 * 1000 }
