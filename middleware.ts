import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n'
import { verifyAdminSessionToken } from '@/lib/admin/session'
import { updateSession } from './lib/supabase/middleware'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: ['/((?!api|auth|_next|visual-search|.*\\..*).*)'],
}
