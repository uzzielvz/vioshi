import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * OAuth callback redirect target. Only same-origin relative paths are allowed.
 * Rejects protocol-relative (//), absolute URLs, and backslash tricks.
 */
function sanitizeAuthRedirectPath(next: string | null | undefined): string {
  if (!next) return '/'

  const path = next.trim()
  if (!path.startsWith('/') || path.startsWith('//')) return '/'
  if (path.includes('\\') || path.includes('://')) return '/'
  if (/^https?:/i.test(path)) return '/'

  return path
}

/**
 * Callback OAuth / magic link / recovery link.
 *
 * Construimos el NextResponse de redirect ANTES del exchange y le pasamos su
 * objeto al cliente Supabase, para que `setAll` aplique las cookies de sesión
 * directamente al response. Si dejamos el patrón "cookies() set + return
 * NextResponse.redirect(...)" las cookies no se propagan al redirect y el
 * usuario aterriza sin sesión (síntoma: redirect_expired en /reset).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = sanitizeAuthRedirectPath(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}${next}?error=auth_callback`)
  }

  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}${next}?error=auth_callback`)
  }

  return response
}
