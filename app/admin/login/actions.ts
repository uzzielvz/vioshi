'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_MAX_AGE_SEC, createAdminSessionToken } from '@/lib/admin/session'

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
) {
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
