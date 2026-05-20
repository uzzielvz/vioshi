'use server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_MAX_AGE_SEC, createAdminSessionToken } from '@/lib/admin/session'
import {
  ADMIN_LOGIN_RATE_LIMIT,
  checkRateLimit,
  getClientIpFromHeaders,
  retryAfterSeconds,
} from '@/lib/rate-limit'

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const ip = getClientIpFromHeaders(headers())
  const rl = checkRateLimit(`admin-login:${ip}`, ADMIN_LOGIN_RATE_LIMIT)

  if (!rl.success) {
    const secs = retryAfterSeconds(rl.resetAt)
    const mins = Math.ceil(secs / 60)
    return {
      error: `Demasiados intentos. Espera ${mins} minuto${mins === 1 ? '' : 's'} e inténtalo de nuevo.`,
    }
  }

  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_SECRET) {
    return { error: 'Incorrect password.' }
  }
  const token = await createAdminSessionToken()
  cookies().set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
    path: '/',
  })
  redirect('/admin/products')
}
