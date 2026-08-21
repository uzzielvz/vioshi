import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'
import { verifyAdminSessionToken } from '@/lib/admin/session'
import {
  checkRateLimit,
  getClientIp,
  retryAfterSeconds,
  VISUAL_SEARCH_RATE_LIMIT,
} from '@/lib/rate-limit'
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/api/visual-search' && request.method === 'POST') {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`visual-search:${ip}`, VISUAL_SEARCH_RATE_LIMIT)

    if (!rl.success) {
      const retryAfter = retryAfterSeconds(rl.resetAt)
      return NextResponse.json(
        {
          error: 'rate_limit',
          message: `Has superado el límite de búsquedas (${VISUAL_SEARCH_RATE_LIMIT.limit} por minuto). Intenta de nuevo en ${retryAfter} segundos.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      )
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_token')?.value
    if (!(await verifyAdminSessionToken(token))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const token = request.cookies.get('admin_token')?.value
    if (!(await verifyAdminSessionToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  const intlResponse = intlMiddleware(request)
  return await updateSession(request, intlResponse)
}

export const config = {
  matcher: [
    '/api/visual-search',
    '/api/admin/:path*',
    // Exclude: api routes (webhooks, etc.), auth callback, static files,
    // and Next.js internals. /visual-search now lives under [locale] so it
    // must go through the intl middleware like any other locale-aware route.
    '/((?!api|auth|_next|.*\\..*).*)',
  ],
}
